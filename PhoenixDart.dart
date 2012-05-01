#import('dart:html');
#source('Phoenix.dart');
#source("i8080.dart");
#source("Color.dart");
#source("Util.dart");


class PhoenixDart {

  Phoenix phoenix;

  int sleepTime;
  int timeNow;
  int timeBefore;

  void runStep() {
    timeBefore = Clock.now();
    bool busy = false;
    while (true) {
          phoenix.cycles++;
          int pc = phoenix.PC();

          // After rendering a frame, the program enters in a
          // busy wait
          // that we don't need emulate. Skipping it increases
          // performance
          // drastically. Here's the 8085 asm code:
          //
          // 128 MVI H,78h
          // 130 MOV A,(HL) // HL=0x78** : memory mapped
          // dipswitches and VSYNC register
          // 131 AND A,80H // BIT 7 is true during VBLANK
          // 133 JZ 128 // busy wait until VBLANK
          //
          // Testing if VBLANK is true actually resets VBLANK
          // (it's a test and set operation).
          // So we need to run the busy wait at least once:
          // that's why we need the "busy" flag.
          if ((!busy) && (pc == 128))
              busy = true;
          else if (busy && (pc == 128)) {
              phoenix.cycles = 0;
          }

          if (phoenix.cycles == 0) {
              phoenix.interrupt();
              timeNow = Clock.now();
              int msPerFrame = ((timeNow - timeBefore)/1000).toInt();
              sleepTime = (1000 / 60 - msPerFrame).toInt();
              
              phoenix.cycles = -phoenix.cyclesPerInterrupt;
              
              if (phoenix.isAutoFrameSkip()){
                  if (phoenix.getFramesPerSecond() > 60) {
                      int frameSkip = phoenix.getFrameSkip();
                      phoenix.setFrameSkip(frameSkip > 1 ? frameSkip -1 : 1);
                  } else if (phoenix.getFramesPerSecond() < 60) {
                      int frameSkip = phoenix.getFrameSkip();
                      phoenix.setFrameSkip(frameSkip < 5 ? frameSkip + 1 : 5);
                  } 
              }
              if (phoenix.isRealSpeed() && (sleepTime > 0)) {
                  window.setTimeout(runStep, sleepTime);
              } else {
                  window.setTimeout(runStep, 1);
              }
              break;
          }
          phoenix.execute();
      }
    }

  CanvasElement initializeCanvas() {
    CanvasElement surface=new Element.tag('canvas');
    surface.width=Phoenix.WIDTH;
    surface.height=Phoenix.HEIGHT;
    document.query("#canvas-content").nodes.add(surface);
    surface.attributes["style"]="width: ${Phoenix.WIDTH} px;";
    surface.focus();
    return surface;
  }
  

  void run() {
    var req = new XMLHttpRequest();
    req.open('GET', "fullprogram.rom", true);
    req.responseType="arraybuffer";
    print("loading rom...");
    req.$dom_addEventListener('load', (e) {
      var arrayview=new Uint8Array.fromBuffer(req.response);
      print("rom loaded: ${arrayview.length} unsigned bytes");
      phoenix = new Phoenix(initializeCanvas());
      phoenix.loadRoms(arrayview);
      //phoenix.initSFX();
      phoenix.decodeChars();
      //phoenix.hiload();
      document.body.on.keyDown.add((ev) {
        phoenix.doKey(ev);
      });

      window.setTimeout(runStep, 1000);
    });
    req.send();
  }
}


void main() {
  new PhoenixDart().run();
}
