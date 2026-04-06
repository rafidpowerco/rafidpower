========================================================================
AL-RAFIDAIN INTEGRATION BLUEPRINT: DELPHI TO AI CLOUD
========================================================================
Target Audience: Eng. Ayman
Execution Rule: Zero-Installation. Paste this code inside your Delphi project (e.g., inside WebSync.pas or directly in your final print button click).

DEPENDENCIES:
You need System.Net.HttpClient, System.Net.URLClient, and System.JSON in your uses clause.

//=======================================================================
// THE DELPHI CODE SNIPPET (Copy & Paste to your .pas file)
//=======================================================================
procedure SyncToAIGateway(CertID: String; ScaleID: String; Weight: Double; out OutHash, OutURL: String);
var
  Client: TNetHTTPClient;
  RequestJSON: TJSONObject;
  ResponseJSON: TJSONObject;
  ResponseStr: string;
  RequestBody: TStringStream;
  HTTPResponse: IHTTPResponse;
begin
  OutHash := '';
  OutURL := '';
  
  Client := TNetHTTPClient.Create(nil);
  RequestJSON := TJSONObject.Create;
  try
    try
      // 1. Package the specific data requested by the FastAPI Python core
      RequestJSON.AddPair('scale_id', ScaleID);
      RequestJSON.AddPair('cert_id', CertID);
      RequestJSON.AddPair('weight', TJSONNumber.Create(Weight));

      RequestBody := TStringStream.Create(RequestJSON.ToString, TEncoding.UTF8);
      
      Client.ContentType := 'application/json';
      
      // 2. Call the AI Brain (ensure this IP/domain matches your host)
      HTTPResponse := Client.Post('http://127.0.0.1:8000/api/process_weight', RequestBody);

      // 3. Process the Golden Result
      if HTTPResponse.StatusCode = 200 then
      begin
        ResponseStr := HTTPResponse.ContentAsString(TEncoding.UTF8);
        ResponseJSON := TJSONObject.ParseJSONValue(ResponseStr) as TJSONObject;
        
        if Assigned(ResponseJSON) then
        begin
          if ResponseJSON.GetValue('status').Value = 'APPROVED' then
          begin
            OutHash := ResponseJSON.GetValue('secure_hash').Value;
            OutURL  := ResponseJSON.GetValue('verification_url').Value;
            
            // --> YOU NOW HAVE THE HASH. Drop OutURL into your DelphiZXIngQRCode module to print.
          end;
          ResponseJSON.Free;
        end;
      end
      else
      begin
         // Server rejected it (e.g. weight was physically impossible)
         // Raise exception or handle error
      end;
    finally
      RequestBody.Free;
    end;
  finally
    RequestJSON.Free;
    Client.Free;
  end;
end;
//=======================================================================

WHY THIS FOLLOWS THE GOLDEN RULE:
You literally just compile the EXE. The client needs NO new libraries, NO python setup. Delphi uses native Windows libraries via `TNetHTTPClient` to send the JSON and get the QR URL data silently. 

Mission Complete.
