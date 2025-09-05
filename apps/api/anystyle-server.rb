# anystyle-server.rb
require 'sinatra'
require 'json'
require 'anystyle'
require 'citeproc' 

set :bind, '0.0.0.0'
set :port, 4567

# AnyStyle::Parser.defaults[:model] = File.expand_path('custom.mod', __dir__)

post '/parse' do
  content_type :json

  body    = request.body.read
  payload = body.empty? ? {} : JSON.parse(body) rescue {}
  refs    = payload['references']
  return_tokens = payload['include_tokens'] || false

  input =
    case refs
    when Array
      refs.join("\n")
    when String
      refs
    end

  halt 400, { error: 'No references provided' }.to_json unless input&.strip&.length&.positive?

  parser  = AnyStyle.parser
  # Parse and get Wapiti dataset (tokens with labels)
  dataset = parser.parse(input, format: :wapiti)
  # Convert to CSL format
  csl_result = parser.format_csl(dataset, date_format: 'citeproc')

  if return_tokens
    # Return both CSL and raw token data for relabeling
    # Convert Wapiti dataset to proper [["label", "token"], ...] format
    token_data = dataset.map do |sequence|
      sequence.map do |token|
        [token.label.to_s, token.value.to_s]
      end
    end
    
    {
      csl: csl_result,
      tokens: token_data
    }.to_json
  else
    # Return only CSL for backward compatibility
    csl_result.to_json
  end
end
