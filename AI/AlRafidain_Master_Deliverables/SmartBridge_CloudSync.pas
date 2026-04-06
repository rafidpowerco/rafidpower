unit SmartBridge_CloudSync;

interface

uses
  System.SysUtils, System.Classes, REST.Client, REST.Types, System.JSON;

type
  // The Data structure collected from the Serial Load Cell
  TWeightData = record
    CertificateID: string;
    ScaleSerial: string;
    ExactWeight: Double;
  end;

  TSmartBridgeAPI = class
  private
    const BASE_URL = 'https://api.alrafidain.com/v1'; // Auto-Update Route endpoint
  public
    class function SyncWeightAndGetQR(Data: TWeightData): string;
  end;

implementation

{ TSmartBridgeAPI }

class function TSmartBridgeAPI.SyncWeightAndGetQR(Data: TWeightData): string;
var
  RESTClient: TRESTClient;
  RESTRequest: TRESTRequest;
  RESTResponse: TRESTResponse;
  JSONPayload: TJSONObject;
  JSONResponse: TJSONValue;
begin
  Result := '';
  RESTClient := TRESTClient.Create(BASE_URL);
  RESTRequest := TRESTRequest.Create(nil);
  RESTResponse := TRESTResponse.Create(nil);
  JSONPayload := TJSONObject.Create;

  try
    RESTRequest.Client := RESTClient;
    RESTRequest.Response := RESTResponse;
    RESTRequest.Resource := '/scales/certify';
    RESTRequest.Method := rmPOST;

    // Build the JSON payload to send to the Python FastAPI Brain
    JSONPayload.AddPair('certificate_id', Data.CertificateID);
    JSONPayload.AddPair('scale_serial', Data.ScaleSerial);
    JSONPayload.AddPair('exact_weight', TJSONNumber.Create(Data.ExactWeight));

    RESTRequest.AddBody(JSONPayload.ToString, ctAPPLICATION_JSON);

    // Execute the request asynchronously (or synchronously for the demo)
    RESTRequest.Execute;

    if RESTResponse.StatusCode = 200 then
    begin
      JSONResponse := TJSONObject.ParseJSONValue(RESTResponse.Content);
      if Assigned(JSONResponse) then
      begin
        // Extract the Immutable QR Hash and the Action command (e.g. "UPDATE_EXE")
        Result := JSONResponse.GetValue<string>('secure_qr_hash');
        
        // Phase B Golden Rule: If the server passes 'AutoUpdateRequired', the wrapper updates the EXE.
        if JSONResponse.GetValue<boolean>('auto_update_triggered') then
        begin
          // Launch the silent updater module
          // WinExec('RafidUpdater.exe', SW_HIDE);
        end;
        JSONResponse.Free;
      end;
    end
    else
    begin
      raise Exception.CreateFmt('Cloud Sync Failed: %d %s', [RESTResponse.StatusCode, RESTResponse.StatusText]);
    end;
  finally
    JSONPayload.Free;
    RESTResponse.Free;
    RESTRequest.Free;
    RESTClient.Free;
  end;
end;

end.
