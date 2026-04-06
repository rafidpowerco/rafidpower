unit SmartBridge_ThemeManager;

interface

uses
  System.Classes, System.SysUtils, Vcl.Forms, Vcl.Controls, Vcl.Graphics,
  cxGraphics, cxControls, cxLookAndFeels, cxLookAndFeelPainters, dxSkinsCore,
  dxSkinscxPCPainter, dxSkinsForm, dxSkinWXI, dxSkinTheBezier, dxSkinOffice2019Colorful;

type
  { TRafidThemeManager
    DevExpress-based Theme Management Engine for Rafid Smart Bridge.
    Handles dynamic skin switching (Dark/Light modes natively) and high-DPI scaling
    for autonomous industrial ecosystems. }
  TRafidThemeManager = class
  private
    FSkinController: TdxSkinController;
    procedure InitializeDevExpressSkins;
  public
    constructor Create(AOwner: TComponent);
    destructor Destroy; override;

    procedure SetTheme(ThemeName: string);
    procedure ApplyDarkMode;
    procedure ApplyLightMode;
    procedure EnableHighDPISupport;
  end;

var
  GlobalThemeManager: TRafidThemeManager;

implementation

{ TRafidThemeManager }

constructor TRafidThemeManager.Create(AOwner: TComponent);
begin
  inherited Create;
  FSkinController := TdxSkinController.Create(AOwner);
  InitializeDevExpressSkins;
end;

destructor TRafidThemeManager.Destroy;
begin
  FSkinController.Free;
  inherited;
end;

procedure TRafidThemeManager.InitializeDevExpressSkins;
begin
  { Enable form skinning to match DevExpress components }
  FSkinController.NativeStyle := False;
  FSkinController.SkinName := 'WXI'; // Default modern look
  FSkinController.UseSkins := True;
end;

procedure TRafidThemeManager.EnableHighDPISupport;
begin
  { High-DPI support critical for large industrial displays }
  Application.HighDPI := True;
  cxLookAndFeelPaintersManager.EnableHighDPI := True;
end;

procedure TRafidThemeManager.SetTheme(ThemeName: string);
begin
  FSkinController.SkinName := ThemeName;
  RootLookAndFeel.SkinName := ThemeName;
end;

procedure TRafidThemeManager.ApplyDarkMode;
begin
  { Switch to heavy industrial environment mode (prevents glare) }
  SetTheme('WXICompact'); // Or 'TheBezier' using a dark palette
  RootLookAndFeel.SkinPaletteName := 'Dark';
end;

procedure TRafidThemeManager.ApplyLightMode;
begin
  { Day shift / Administration mode }
  SetTheme('WXICompact');
  RootLookAndFeel.SkinPaletteName := 'Light';
end;

initialization

finalization
  if Assigned(GlobalThemeManager) then
    GlobalThemeManager.Free;

end.
