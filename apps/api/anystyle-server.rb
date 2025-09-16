# anystyle-server.rb
require 'sinatra'
require 'json'
require 'anystyle'
require 'citeproc'
require 'securerandom' 


set :bind, '0.0.0.0'
set :port, 4567
set :environment, :production

# Parse references and return tokens with labels (plus originalText)
post '/parse' do
  content_type :json
  payload = JSON.parse(request.body.read) rescue {}
  input_refs = payload['input']
  halt 400, { error: 'No input provided' }.to_json unless input_refs.is_a?(Array) && !input_refs.empty?

  begin
    parser = AnyStyle.parser

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

    { references: references }.to_json
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
