# anystyle-server.rb
require 'sinatra'
require 'json'
require 'anystyle'
require 'citeproc' 

set :bind, '0.0.0.0'
set :port, 4567

# AnyStyle::Parser.defaults[:model] = File.expand_path('custom.mod', __dir__)

# Parse references and return tokens with labels for training/relabeling
post '/parse' do
  content_type :json

  body    = request.body.read
  payload = body.empty? ? {} : JSON.parse(body) rescue {}
  refs    = payload['references']

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
  
  # Convert Wapiti dataset to [["label", "token"], ...] format
  token_data = dataset.map do |sequence|
    sequence.map do |token|
      [token.label.to_s, token.value.to_s]
    end
  end
  
  {
    tokens: token_data
  }.to_json
end

# Convert references to CSL format for bibliography use
post '/convert-to-csl' do
  content_type :json

  body    = request.body.read
  payload = body.empty? ? {} : JSON.parse(body) rescue {}
  refs    = payload['references']

  input =
    case refs
    when Array
      refs.join("\n")
    when String
      refs
    end

  halt 400, { error: 'No references provided' }.to_json unless input&.strip&.length&.positive?

  parser  = AnyStyle.parser
  # Parse and get Wapiti dataset
  dataset = parser.parse(input, format: :wapiti)
  # Convert to CSL format
  csl_result = parser.format_csl(dataset, date_format: 'citeproc')
  
  {
    csl: csl_result
  }.to_json
end

# Convert edited tokens back to CSL format
# post '/tokens-to-csl' do
#   content_type :json

#   body    = request.body.read
#   payload = body.empty? ? {} : JSON.parse(body) rescue {}
#   tokens  = payload['tokens']

#   halt 400, { error: 'No tokens provided' }.to_json unless tokens&.is_a?(Array)

#   begin
#     # For now, let's just return the tokens as received for debugging
#     # TODO: Implement proper token to CSL conversion
#     {
#       debug: "tokens received",
#       token_count: tokens.length,
#       first_sequence_length: tokens.first&.length,
#       tokens: tokens
#     }.to_json
#   rescue => e
#     halt 500, { error: "Conversion failed: #{e.message}" }.to_json
#   end
# end

# Convert tokens to XML format for training data export
post '/tokens-to-xml' do
  content_type 'application/xml'

  body    = request.body.read
  payload = body.empty? ? {} : JSON.parse(body) rescue {}
  tokens  = payload['tokens']

  halt 400, { error: 'No tokens provided' }.to_json unless tokens&.is_a?(Array)

  begin
    xml = '<?xml version="1.0" encoding="UTF-8"?>' + "\n"
    xml += '<dataset>' + "\n"

    tokens.each_with_index do |sequence, index|
      halt 400, { error: 'Invalid sequence format' }.to_json unless sequence.is_a?(Array)
      
      xml += "  <sequence id=\"#{index + 1}\">" + "\n"
      
      sequence.each do |label_token_pair|
        halt 400, { error: 'Invalid token format' }.to_json unless label_token_pair.is_a?(Array) && label_token_pair.length == 2
        
        label, token = label_token_pair
        
        # Escape XML special characters
        escaped_token = token.to_s
          .gsub('&', '&amp;')
          .gsub('<', '&lt;')
          .gsub('>', '&gt;')
          .gsub('"', '&quot;')
          .gsub("'", '&apos;')
        
        xml += "    <token label=\"#{label}\">#{escaped_token}</token>" + "\n"
      end
      
      xml += "  </sequence>" + "\n"
    end

    xml += '</dataset>'
    
    # Set appropriate headers for XML download
    headers['Content-Disposition'] = "attachment; filename=\"training-data-#{Time.now.to_i}.xml\""
    
    xml
  rescue => e
    content_type :json
    halt 500, { error: "XML conversion failed: #{e.message}" }.to_json
  end
end
