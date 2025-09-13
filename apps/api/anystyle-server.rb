# anystyle-server.rb
require 'sinatra'
require 'json'
require 'anystyle'
require 'citeproc'
require 'securerandom' 


set :bind, '0.0.0.0'
set :port, 4567

# Parse references and return tokens with labels (plus originalText),
# using custom model if available.
post '/parse' do
  content_type :json
  payload = JSON.parse(request.body.read) rescue {}
  input_refs = payload['input']
  halt 400, { error: 'No input provided' }.to_json unless input_refs.is_a?(Array) && !input_refs.empty?

  begin
    custom_model_file = File.join('/app', 'custom.mod')
    using_custom_model = File.exist?(custom_model_file)
    parser = using_custom_model ? AnyStyle::Parser.new(model: custom_model_file) : AnyStyle.parser

    dataset = parser.parse(input_refs, format: :wapiti)

    references = input_refs.each_with_index.map do |ref, idx|
      seq = dataset[idx]
      tokens = (seq && seq.respond_to?(:map)) ? seq.map { |t| [t.label.to_s, t.value.to_s] } : []
      {
        id: SecureRandom.uuid,
        originalText: ref,
        tokens: tokens,
      }
    end

    {
      modelUsed: using_custom_model ? 'custom.mod' : 'default',
      references: references
    }.to_json
  rescue => e
    halt 500, { error: "Parsing failed: #{e.message}", backtrace: e.backtrace&.first(5) }.to_json
  end
end

# Convert token arrays to CSL format
post '/convert-to-csl' do
  content_type :json
  payload = JSON.parse(request.body.read) rescue {}

  refs = payload['references']
  halt 400, { error: 'No references provided' }.to_json unless refs.is_a?(Array) && !refs.empty?

  begin
    require 'wapiti'

    sequences = refs.map do |r|
      tokens = r['tokens']
      next nil unless tokens.is_a?(Array)
      Wapiti::Sequence.new(tokens.map { |label, val| Wapiti::Token.new(val.to_s, label: label.to_s) })
    end.compact

    dataset = Wapiti::Dataset.new(sequences)
    parser = AnyStyle.parser
    csl_results = parser.format_csl(dataset, date_format: 'citeproc')

    csl_with_ids = csl_results.each_with_index.map do |item, idx|
      ref_id = refs[idx]['id'] || SecureRandom.uuid
      item.merge('id' => ref_id)
    end

    { csl: csl_with_ids }.to_json
  rescue => e
    halt 500, { error: "CSL conversion failed: #{e.message}", backtrace: e.backtrace&.first(5) }.to_json
  end
end

# Train a custom AnyStyle model with provided training data
post '/train-model' do
  content_type :json
  
  body = request.body.read
  payload = body.empty? ? {} : JSON.parse(body) rescue {}
  tokens = payload['tokens']
  
  halt 400, { error: 'No tokens provided' }.to_json unless tokens&.is_a?(Array)
  
  begin
    require 'tmpdir'
    require 'nokogiri'
    require 'rexml/document'
    
    # Create temporary directory for training
    Dir.mktmpdir do |tmpdir|
      xml_file = File.join(tmpdir, 'training.xml')
      model_file = File.join('/app', 'custom.mod')
      
      # Convert tokens to XML format (as expected by AnyStyle)
      builder = Nokogiri::XML::Builder.new(encoding: 'UTF-8') do |xml|
        xml.dataset do
          tokens.each_with_index do |sequence, seq_idx|
            halt 400, { error: 'Invalid sequence format' }.to_json unless sequence.is_a?(Array)
            
            xml.sequence do
              sequence.each do |label_token_pair|
                halt 400, { error: 'Invalid token format' }.to_json unless label_token_pair.is_a?(Array) && label_token_pair.length == 2
                
                label, token_text = label_token_pair
                xml.send(label.to_sym, token_text.to_s)
              end
            end
          end
        end
      end
      
      # Write XML training data
      File.write(xml_file, builder.to_xml)
      
      # Enhanced training: combine with core dataset (like anystyle.io)
      # Enhanced training: combine with core dataset (like anystyle.io)
      begin
        require 'wapiti'
        
        # Create parser and combine datasets
        parser = AnyStyle::Parser.new
        
        # Load core dataset
        core_dataset = Wapiti::Dataset.open(AnyStyle::Parser.defaults[:training_data])
        
        # Load good dataset (additional high-quality training data)
        good_dataset_path = File.join(Gem.loaded_specs['anystyle'].full_gem_path, 'res', 'parser', 'good.xml')
        good_dataset = Wapiti::Dataset.parse(
          REXML::Document.new(File.read(good_dataset_path))
        )
        
        # Parse our custom XML data
        custom_dataset = Wapiti::Dataset.parse(
          REXML::Document.new(File.read(xml_file))
        )
        
        # Combine all three datasets: core | good | custom (union operations)
        combined_dataset = core_dataset | good_dataset | custom_dataset
        
        # Train with combined data
        parser.train(combined_dataset, truncate: true)
        
        # Save the trained model
        parser.model.save(model_file)
        
        training_method = "AnyStyle Ruby API with core + good datasets"
        
      rescue => e
        # Fallback to CLI method if Ruby API fails
        training_cmd = "anystyle train #{xml_file} #{model_file}"
        training_result = system(training_cmd)
        training_method = "AnyStyle CLI (fallback)"
        
        unless training_result
          halt 500, {
            error: 'Both training methods failed',
            ruby_api_error: e.message,
            cli_result: training_result
          }.to_json
        end
      end
      
      # Check if model file was created
      if File.exist?(model_file)
        model_size = File.size(model_file)
        
        {
          model_path: model_file,
          model_size_bytes: model_size,
          training_sequences: tokens.length,
          training_tokens: tokens.sum(&:length),
          training_method: training_method,
          message: "Custom model trained successfully, combined with core dataset",
          timestamp: Time.now.iso8601
        }.to_json
      else
        {
          error: 'Model training failed',
          xml_preview: File.read(xml_file).lines.first(10).join(''),
          training_method: training_method
        }.to_json
      end
    end
    
  rescue => e
    halt 500, { 
      error: "Model training failed: #{e.message}",
      backtrace: e.backtrace.first(10)
    }.to_json
  end
end
