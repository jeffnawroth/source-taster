# anystyle-server.rb
require 'sinatra'
require 'json'
require 'anystyle'
require 'citeproc'

set :bind, '0.0.0.0'
set :port, 4567

# Parse references and return tokens with labels using custom model (if available)
post '/parse' do
  content_type :json

  body = request.body.read
  payload = body.empty? ? {} : JSON.parse(body) rescue {}
  input_refs = payload['input']

  halt 400, { error: 'No input provided' }.to_json unless input_refs&.is_a?(Array) && !input_refs.empty?

  begin
    # Try to use custom model if available, otherwise fall back to default
    custom_model_file = File.join('/app', 'custom.mod')
    
    parser = if File.exist?(custom_model_file)
               AnyStyle::Parser.new(model: custom_model_file)
             else
               AnyStyle.parser
             end

    # Parse each reference and get tokens
    token_data = input_refs.map do |ref|
      # Parse and get Wapiti dataset (tokens with labels)
      dataset = parser.parse([ref], format: :wapiti)
      
      # Convert first sequence to [["label", "token"], ...] format
      sequence = dataset.first
      next [] unless sequence
      
      sequence.map do |token|
        [token.label.to_s, token.value.to_s]
      end
    end

    {
      success: true,
      model_used: File.exist?(custom_model_file) ? 'custom.mod' : 'default',
      tokens: token_data
    }.to_json

  rescue => e
    halt 500, {
      error: "Parsing failed: #{e.message}",
      backtrace: e.backtrace.first(5)
    }.to_json
  end
end

# Convert token arrays to CSL format
post '/convert-to-csl' do
  content_type :json

  body = request.body.read
  payload = body.empty? ? {} : JSON.parse(body) rescue {}
  token_arrays = payload['tokens']

  halt 400, { error: 'No tokens provided' }.to_json unless token_arrays&.is_a?(Array)

  begin
    require 'wapiti'
    
    # Create Wapiti dataset from token arrays (like anystyle.io does)
    dataset = Wapiti::Dataset.new(token_arrays.map do |token_sequence|
      next nil if token_sequence.empty?
      
      # Create Wapiti sequence from tokens
      Wapiti::Sequence.new(token_sequence.map do |label, token_value|
        Wapiti::Token.new(token_value.to_s, label: label.to_s)
      end)
    end.compact)

    # Format as CSL using AnyStyle with citeproc date format (like anystyle.io)
    parser = AnyStyle.parser
    csl_results = parser.format_csl(dataset, date_format: 'citeproc')

    {
      success: true,
      csl: csl_results
    }.to_json

  rescue => e
    halt 500, {
      error: "CSL conversion failed: #{e.message}",
      backtrace: e.backtrace.first(5)
    }.to_json
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
      begin
        require 'wapiti'
        
        # Create parser and combine datasets
        parser = AnyStyle::Parser.new
        
        # Load core dataset
        core_dataset = Wapiti::Dataset.open(AnyStyle::Parser.defaults[:training_data])
        
        # Parse our custom XML data
        custom_dataset = Wapiti::Dataset.parse(
          REXML::Document.new(File.read(xml_file))
        )
        
        # Combine datasets: core | custom (union operation)
        combined_dataset = core_dataset | custom_dataset
        
        # Train with combined data
        parser.train(combined_dataset, truncate: true)
        
        # Save the trained model
        parser.model.save(model_file)
        
        training_method = "AnyStyle Ruby API with core dataset"
        
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
          success: true,
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
