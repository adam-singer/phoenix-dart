
class Phoenix extends i8080 {
  /*
  Phoenix Arcade Emulator for Dart
    (based on http://gwt-phoenix.appspot.com)

    Dart version by Renato Mangini (mangini@google.com) based on 
    Emulator by Murilo Saraiva de Queiroz (muriloq@gmail.com) based on 
    Phoenix Emulator by Richard Davies (R.Davies@dcs.hull.ac.uk) and MAME 
    project, by Nicola Salmoria (MC6489@mclink.it) and others.

    The emulator structure, and many solutions are based in Jasper, the 
    Java Spectrum Emulator, by Adam Davidson & Andrew Pollard.
        Used with permission.
    
    The machine architecture information is from Ralph Kimmlingen
    (ub2f@rz.uni-karlsruhe.de).

Phoenix Hardware Specification
Resolution 26x8 = 208 columns x 32x8 = 256 lines
Phoenix memory map

  0000-3fff 16Kb Program ROM
  4000-43ff 1Kb Video RAM Charset A (4340-43ff variables)
  4400-47ff 1Kb Work RAM
  4800-4bff 1Kb Video RAM Charset B (4840-4bff variables)
  4c00-4fff 1Kb Work RAM
  5000-53ff 1Kb Video Control write-only (mirrored)
  5400-47ff 1Kb Work RAM
  5800-5bff 1Kb Video Scroll Register (mirrored)
  5c00-5fff 1Kb Work RAM
  6000-63ff 1Kb Sound Control A (mirrored)
  6400-67ff 1Kb Work RAM
  6800-6bff 1Kb Sound Control B (mirrored)
  6c00-6fff 1Kb Work RAM
  7000-73ff 1Kb 8bit Game Control read-only (mirrored)
  7400-77ff 1Kb Work RAM
  7800-7bff 1Kb 8bit Dip Switch read-only (mirrored)
  7c00-7fff 1Kb Work RAM
  
  memory mapped ports:
  
    read-only:
    7000-73ff IN
    7800-7bff Dip-Switch Settings (DSW)
    
    * IN (all bits are inverted)
    * bit 7 : barrier
    * bit 6 : Left
    * bit 5 : Right
    * bit 4 : Fire
    * bit 3 : -
    * bit 2 : Start 2
    * bit 1 : Start 1
    * bit 0 : Coin
    
    * Dip-Switch Settings (DSW)
    * bit 7 : VBlank
    * bit 6 : free play (pleiads only)
    * bit 5 : attract sound 0 = off 1 = on (pleiads only?)
    * bit 4 : coins per play  0 = 1 coin  1 = 2 coins
    * bit 3 :\ bonus
    * bit 2 :/ 00 = 3000  01 = 4000  10 = 5000  11 = 6000
    * bit 1 :\ number of lives
    * bit 0 :/ 00 = 3  01 = 4  10 = 5  11 = 6
     
    Pallete
    0 bit 5 of video ram value (divides 256 chars in 8 color sections)
    1 bit 6 of video ram value (divides 256 chars in 8 color sections)
    2 bit 7 of video ram value (divides 256 chars in 8 color sections)
    3 bit 0 of pixelcolor  (either from CHAR-A or CHAR-B, depends on Bit5)
    4 bit 1 of pixelcolor  (either from CHAR-A or CHAR-B, depends on Bit5) 
    5 0 = CHAR-A, 1 = CHAR-B
    6 palette flag (see video control reg.)
    7 always 0
*/
  CanvasRenderingContext2D canvasGraphics;
  CanvasRenderingContext2D backGraphics;
  CanvasRenderingContext2D frontGraphics;
  ImageData backImageData;
  ImageData frontImageData;

  List<Color> characters0; // decoded characters, for each palette
  List<Color> characters1; // decoded characters, for each palette

    static final int WIDTH_PIXELS = 208;
    static final int HEIGHT_PIXELS = 256;
    static final int SCALE_PIXELS = 1;
    static int WIDTH = WIDTH_PIXELS * SCALE_PIXELS;
    static int HEIGHT = HEIGHT_PIXELS * SCALE_PIXELS;

    List<int> chr; // CHARSET roms

    bool vBlank = false;    
    int scrollRegister   = 0;
    int oldScrollRegister  = 0;
    int palette = 0;
    
    bool backgroundRefresh = true;
    bool foregroundRefresh = true;
    List<int> dirtyForeground;
    List<int> dirtyBackground;
    
    List<int> gameControl;
    List<bool> desiredGameControlForNextLoop;
    int interruptCounter = 0;
    
    bool autoFrameSkip=true;
    bool realSpeed=true;
    bool mute=false;
    int frameSkip = 1;
    int timeOfLastFrameInterrupt = 0;
    int timeNow = 0;
    int timeBefore = 0;
    double framesPerSecond;
    int msPerFrame;
    
    // R, G, B, Alpha
    static final Color OPAQUE_BLACK = const Color(0, 0, 0, 1.0); // opaque!
    static final Color BLACK = const Color(0, 0, 0, 0.0); // transparent!
    static final Color WHITE = const Color(0xdb, 0xdb, 0xdb, 1.0);
    static final Color RED = const Color(0xff, 0, 0, 1.0);
    static final Color GREEN = const Color(0, 0xff, 0, 1.0);
    static final Color BLUE = const Color(0x24, 0x24, 0xdb, 1.0);
    static final Color CYAN = const Color(0, 0xff, 0xdb, 1.0);
    static final Color YELLOW = const Color(0xff, 0xff, 00, 1.0);
    static final Color PINK = const Color(0xff, 0xb6, 0xdb, 1.0);
    static final Color ORANGE = const Color(0xff, 0xb6, 0x49, 1.0);
    static final Color LTPURPLE = const Color(0xff, 0x24, 0xb6, 1.0);
    static final Color DKORANGE = const Color(0xff, 0xb6, 0x00, 1.0);
    static final Color DKPURPLE = const Color(0xb6, 0x24, 0xff, 1.0);
    static final Color DKCYAN = const Color(0x00, 0xdb, 0xdb, 1.0);
    static final Color DKYELLOW = const Color(0xdb, 0xdb, 0x00, 1.0);
    static final Color BLUISH = const Color(0x95, 0x95, 0xff, 1.0);
    static final Color PURPLE = const Color(0xff, 0x00, 0xff, 1.0);
    static final Color TRANSPARENT = const Color(0, 0, 0, 0);
    
    // pallete x charset x character = color 
    // 4 colors per pixel * 8 groups of characters * 2 charsets * 2 pallettes
    static final List<Color> colorTable=const [
        /* charset A pallette A */
        BLACK,BLACK,CYAN,CYAN,      // Background, Unused, Letters, asterisks
        BLACK,YELLOW,RED,WHITE,     // Background, Ship middle, Numbers/Ship, Ship edge
        BLACK,YELLOW,RED,WHITE,     // Background, Ship middle, Ship, Ship edge/bullets
        BLACK,PINK,PURPLE,YELLOW,   // Background, Bird eyes, Bird middle, Bird Wings
        BLACK,PINK,PURPLE,YELLOW,   // Background, Bird eyes, Bird middle, Bird Wings
        BLACK,PINK,PURPLE,YELLOW,   // Background, Bird eyes, Bird middle, Bird Wings
        BLACK,WHITE,PURPLE,YELLOW,  // Background, Explosions
        BLACK,PURPLE,GREEN,WHITE,   // Background, Barrier
        /* charset A pallette B */
        BLACK,BLUE,CYAN,CYAN,       // Background, Unused, Letters, asterisks
        BLACK,YELLOW,RED,WHITE,     // Background, Ship middle, Numbers/Ship, Ship edge
        BLACK,YELLOW,RED,WHITE,     // Background, Ship middle, Ship, Ship edge/bullets
        BLACK,YELLOW,GREEN,PURPLE,  // Background, Bird eyes, Bird middle, Bird Wings
        BLACK,YELLOW,GREEN,PURPLE,  // Background, Bird eyes, Bird middle, Bird Wings
        BLACK,YELLOW,GREEN,PURPLE,  // Background, Bird eyes, Bird middle, Bird Wings
        BLACK,WHITE,RED,PURPLE,     // Background, Explosions
        BLACK,PURPLE,GREEN,WHITE,   // Background, Barrier
        /* charset B pallette A */
        BLACK,RED,BLUE,WHITE,           // Background, Starfield
        BLACK,PURPLE,BLUISH,DKORANGE,   // Background, Planets
        BLACK,DKPURPLE,GREEN,DKORANGE,  // Background, Mothership: turrets, u-body, l-body
        BLACK,BLUISH,DKPURPLE,LTPURPLE, // Background, Motheralien: face, body, feet
        BLACK,PURPLE,BLUISH,GREEN,      // Background, Eagles: face, body, shell
        BLACK,PURPLE,BLUISH,GREEN,      // Background, Eagles: face, body, feet
        BLACK,PURPLE,BLUISH,GREEN,      // Background, Eagles: face, body, feet
        BLACK,PURPLE,BLUISH,GREEN,      // Background, Eagles: face, body, feet
        /* charset B pallette B */
        BLACK,RED,BLUE,WHITE,           // Background, Starfield
        BLACK,PURPLE,BLUISH,DKORANGE,   // Background, Planets
        BLACK,DKPURPLE,GREEN,DKORANGE,  // Background, Mothership: turrets, upper body, lower body
        BLACK,BLUISH,DKPURPLE,LTPURPLE, // Background, Motheralien: face, body, feet
        BLACK,BLUISH,LTPURPLE,GREEN,    // Background, Eagles: face, body, shell
        BLACK,BLUISH,LTPURPLE,GREEN,    // Background, Eagles: face, body, feet
        BLACK,BLUISH,LTPURPLE,GREEN,    // Background, Eagles: face, body, feet
        BLACK,BLUISH,LTPURPLE,GREEN,    // Background, Eagles: face, body, feet
    ];


  int sleepTime;
  CanvasElement backCanvas;
  CanvasElement frontCanvas;
  bool scrollRefresh;

  // Phoenix runs at 0.74 Mhz (?)
  Phoenix(CanvasElement canvas) : super(0.74) {
    this.canvasGraphics = canvas.getContext("2d");
    this.msPerFrame = (1000/60).toInt();
    backCanvas=new Element.tag('canvas');
    backCanvas.width=WIDTH;
    backCanvas.height=HEIGHT;
    this.backGraphics = backCanvas.getContext("2d");
    this.backImageData = backGraphics.createImageData(WIDTH, HEIGHT);
    frontCanvas=new Element.tag('canvas');
    frontCanvas.width=WIDTH;
    frontCanvas.height=HEIGHT;
    this.frontGraphics = frontCanvas.getContext("2d");
    this.frontImageData = frontGraphics.createImageData(WIDTH, HEIGHT);
    this.gameControl = new List<int>(8);
    this.desiredGameControlForNextLoop = new List<bool>(8);
    this.dirtyForeground = new List<int>();
    this.dirtyBackground = new List<int>();
    this.chr=new List<int>(0x2000); // CHARSET roms
    Util.initializeIntList(chr);
    Util.initializeIntList(gameControl);
    Util.initializeBoolList(desiredGameControlForNextLoop);
    this.framesPerSecond=0.0;
  }        
 

    /** Byte access */
    void pokeb( int addr, int newByte ) {

        addr &= 0xffff;

        if ( addr >=  0x5800 && addr <= 0x5bff ) {
            scrollRegister = newByte;
            if ( scrollRegister != oldScrollRegister ) {
                oldScrollRegister = scrollRegister;
                scrollRefresh = true;
            }
        }
        
        // Write on foreground
        if ( (addr >= 0x4000) && (addr <= 0x4340) ){
            dirtyForeground.add(addr);
            foregroundRefresh = true; 
        }
        
        if ( (addr >= 0x4800)&&(addr <= 0x4b40) ) {
            dirtyBackground.add(addr);
            backgroundRefresh = true;  
        }

        if ( addr >= 0x5000 && addr <= 0x53ff ) {
            palette = newByte & 0x01; 
        }
        
        if ( addr >= 0x6000 && addr <= 0x63ff) {
            if ( peekb(addr)!=newByte ) {
                mem[addr] = newByte;
                // sound.updateControlA((byte)newByte);
                if (!isMute()) {
/* SOUND SUPPORT                    if ( newByte==143 ) explosionSFX.play ();
                    if ( (newByte>101)&&(newByte<107) ) laserSFX.play ();
                    if ( newByte==80 ) blowSFX.play ();
*/                }
                // canvasGraphics.setFocus(true);
            }
        }

        if ( addr >= 0x6800 && addr <= 0x6bff) {
            if ( peekb(addr)!=newByte ) {
                mem[ addr ] = newByte;
                // sound.updateControlB((byte) newByte);
                if (!isMute()){
/* SOUND SUPPORT                   if ( newByte==12 ) shieldSFX.play ();
                    if ( newByte==2 ) hitSFX.play ();
*/                }
                // canvasGraphics.setFocus(true);
            }
        }

        // Hi Score Saving - Thanks MAME ! :)
        if ( addr == 0x438c ) {
            if ( newByte == 0x0f ) {
                mem[addr]=newByte;
/* SCORE SUPPORT                int hiScore = getScore(0x4388);
                if ( hiScore > savedHiScore ) hisave();
                if ( hiScore < savedHiScore ) hiload();
*/            }
        }

        if ( addr >= 0x4000 ) {   // 0x0000 - 0x3fff Program ROM 
            mem [addr]=newByte; 
        }

        return;
    }

    /** Word access */
    void pokew( int addr, int word ) {
        addr &= 0xffff;
        List<int> _mem = mem;
        if ( addr >= 0x4000 ) {
            _mem[ addr ] = word & 0xff;
            if ( ++addr != 65536 ) {
                _mem[ addr ] = word >> 8;
            }
        }
        return;
    }

    int peekb(int addr) {
        addr &= 0xffff;
        
        // are we reading dip switch memory ?
        if (addr >= 0x7800 && addr <= 0x7bff) { 
            // if SYNC bit of switch is 1
            if (vBlank) { 
                vBlank = false; // set it to 0
                return 128;     // return value where bit 7 is 1
            } else
                return 0;       // return value where bit 7 is 0
        }
        
        // are we reading the joystick ?
        if (addr >= 0x7000 && addr <= 0x73ff) {
            int c = 0;
            for (int i = 0; i < 8; i++)
                c |= gameControl[i] << i;
            return c;
        }

        // we are reading a standard memory address
        else
            return mem[addr];
    }

    int peekw( int addr ) {
        addr &= 0xffff;
        int t = peekb( addr );
        addr++;
        return t | (peekb( addr ) << 8);
    }

/*    
    void initSFX() {
        soundController = new SoundController();
        this.laserSFX = loadSFX("laser"); 
        this.explosionSFX = loadSFX("explo");
        this.blowSFX = loadSFX("blow");
        this.shieldSFX = loadSFX("shield");
        this.hitSFX = loadSFX("hit");
    }


    Sound loadSFX(String name) {
        Sound sfx = soundController.createSound(Sound.MIME_TYPE_AUDIO_OGG_VORBIS, name+".ogg");
        sfx.play();
        if (LoadState.LOAD_STATE_NOT_SUPPORTED == sfx.getLoadState()){
            sfx = soundController.createSound(Sound.MIME_TYPE_AUDIO_MPEG_MP3, name+".mp3");
            sfx.play();
            if (LoadState.LOAD_STATE_NOT_SUPPORTED == sfx.getLoadState()){
                sfx = soundController.createSound(Sound.MIME_TYPE_AUDIO_WAV_PCM, name+".wav");
                sfx.play();
            }
        }
        System.out.println("Loaded "+sfx.getMimeType()+", "+sfx.getSoundType()+", "+sfx.getLoadState());
        return sfx;
    }

*/
    
    /** 
     * 0x0000 - 0x3FFF: Program ROM
     * 0x4000 - 0x5FFF: Graphics ROM
     * @param buffer
     */
    void loadRoms(List<int> buffer){
        for ( int i=0;i<=0x3fff;i++ ) {
            mem[i]=(buffer[i]+256)&0xff;
        }
        for ( int i=0;i<=0x1fff;i++ ) {
            chr[i]=buffer[i+0x4000];
        }
    }
 
    int interrupt() {
        interruptCounter++;

        vBlank = true;

        refreshGameControls();

        if (interruptCounter % getFrameSkip() == 0) {
            refreshScreen();
        }

        if ((interruptCounter % 10) == 0) {
          resetGameControls();
        }
        
        // Update speed indicator every second
        if ((interruptCounter % 60) == 0) {
            timeNow = Clock.now();
            msPerFrame = timeNow - timeBefore; // ms / frame
            framesPerSecond = Clock.frequency() / (msPerFrame / 60); // frames / s
            timeBefore = timeNow;
        }

        return super.interrupt();
    }
    
    void refreshGameControls() {
      for (int i=0; i<gameControl.length; i++) {
          gameControl[i]=this.desiredGameControlForNextLoop[i]?0:1;
      }
    }
    
    void resetGameControls() {
      for (int i=0; i<gameControl.length; i++) {
          gameControl[i]=this.desiredGameControlForNextLoop[i]?0:1;
          desiredGameControlForNextLoop[i]=false;
      }
    }


    void refreshScreen () {
        if ( (!backgroundRefresh && !foregroundRefresh) && !scrollRefresh) return; 

        List<Color> paletteChars=palette==0?characters0:characters1;

        if (backgroundRefresh) {
            for (int a_i=0; a_i<dirtyBackground.length; a_i++) {
                int a=dirtyBackground[a_i];
                int base = a - 0x4800;   // 18432
                int x = 25 - (base / 32).floor().toInt();
                if (x<0) {x=0;}
                int y = base % 32;
                int character = mem[a];
                for ( int i=0;i<8;i++ ) {
                    for ( int j=0;j<8;j++ ) {
                        Color c = paletteChars[character*64+j+i*8];
                        //backImageData.setColor(x*8+j,y*8+i, c);
                        //  in gwt imagedata: 4*( Y:[y+8+i]*width  + X:[x*8+j] )+offset
                        // 4 bytes per pixel, 8 pixels/block, 8 blocks per row (width)
                        int __x=x*8+j;
                        int __y=y*8+i;
                        int baseaddr=4*(__y*WIDTH+__x);
                        backImageData.data[baseaddr] = c.r;
                        backImageData.data[baseaddr+1] = c.g;
                        backImageData.data[baseaddr+2] = c.b;
                        backImageData.data[baseaddr+3] = (255*c.alpha).toInt();
                    }
                }
            }
            backGraphics.putImageData(backImageData, 0, 0);
            backgroundRefresh = false;
            dirtyBackground.clear();
        }
         
        if (foregroundRefresh) {
              for (int a_i=0; a_i<dirtyForeground.length; a_i++) {
                int a=dirtyForeground[a_i];
                int base = a - 0x4000;
                int x = 25 - (base / 32).toInt();
                if (x<0) {x=0;}
                int y = base % 32;
                int character = mem[a];
                for ( int i=0;i<8;i++ ) {
                    for ( int j=0;j<8;j++ ) {
                        Color c = paletteChars[64*256+character*64+j+i*8];
                        int __x=x*8+j;
                        int __y=y*8+i;
                        int baseaddr=4*(__y*WIDTH+__x);
                        frontImageData.data[baseaddr] = c.r;
                        frontImageData.data[baseaddr+1] = c.g;
                        frontImageData.data[baseaddr+2] = c.b;
                        frontImageData.data[baseaddr+3] = (255*c.alpha).toInt();
                    }
                }
            }
            frontGraphics.putImageData(frontImageData, 0, 0);
            foregroundRefresh = false;
            dirtyForeground.clear();
        }
        canvasGraphics.setFillColor(OPAQUE_BLACK.dr, OPAQUE_BLACK.dg, OPAQUE_BLACK.db, OPAQUE_BLACK.alpha);
        canvasGraphics.fillRect(0,0,WIDTH,HEIGHT);
        
       canvasGraphics.drawImage(backCanvas, 0,HEIGHT-scrollRegister);
        canvasGraphics.drawImage(backCanvas, 0,-scrollRegister);
        scrollRefresh = false; 
        
        canvasGraphics.drawImage(frontCanvas, 0,0); 
        
        canvasGraphics.setFillColor(DKYELLOW.dr, DKYELLOW.dg, DKYELLOW.db, DKYELLOW.alpha);
        canvasGraphics.fillText(framesPerSecond.toInt().toString(),0,255);
        
        if (!isRealSpeed())
            canvasGraphics.fillText("S",WIDTH-24,255);
        
        if ( (isAutoFrameSkip()) && (getFrameSkip()!=1) )
            canvasGraphics.fillText("A",WIDTH-32,255);

        if (isMute())
            canvasGraphics.fillText("M",WIDTH-48,255);

        if (getFrameSkip() != 1)
            canvasGraphics.fillText(getFrameSkip().toString(),WIDTH-16,255);
        
    }

    void decodeChars () {
        characters0=new List<Color>(512*64);
        characters1=new List<Color>(512*64);

        for ( int s=0;s<2;s++ ) {               // Charset
            for ( int c=0;c<256;c++ ) {         // Character
                List<List<int>> block = new List<List<int>>(8);
                for ( int _c=0; _c<block.length; _c++) {
                  block[_c]=new List<int>(8);
                  Util.initializeIntList(block[_c]);
                }
                for ( int plane=0; plane<2;plane++ ) {  // Bit plane
                    for ( int line=0; line<8; line++ ) {  // line
                        int b = chr[s*4096+c*8+plane*256*8+line];
                        List<int> bin= new List<int>(8);                         // binary representation
                        Util.initializeIntList(bin);
                        bin[0]=(b&1)>>0;
                        bin[1]=((b&2)>>1);
                        bin[2]=((b & 4)>>2);
                        bin[3]=((b & 8)>>3);
                        bin[4]=((b & 16)>>4);
                        bin[5]=((b & 32)>>5);
                        bin[6]=((b & 64)>>6);
                        bin[7]=((b & 128)>>7);
                        for ( int col=0;col<8;col++ ) {   // Coluna
                            block[line][col]+= (1+(1-plane))*bin[col];
                            int pixelColorIndex = 0; 
                             pixelColorIndex = (( (c & 0xff) >> 5 )&0xff)*4; // bits 5-7 of video ram value
                             pixelColorIndex += block[line][col];            // pixel color
                             pixelColorIndex += (1-s) * 64;                  // charset

//                             // Draw characters on screen
//                             if ( (block[line][col]>0) ) {
//                                 canvasGraphics.setFillStyle(colorTable[pixelColorIndex]);
//                             } else {
//                                 canvasGraphics.setFillStyle(BLACK);
//                             }
//                             canvasGraphics.fillRectangle(7-line+(c%26)*8,col+((int)c/26)*8+s*160,1,1);

                             // Palette A
                             Color color = colorTable[pixelColorIndex];
                             if (color.r==BLACK.r && color.g==BLACK.g && color.b==BLACK.b) 
                                 color = TRANSPARENT; 
                             characters0[s*256*64+c*64+col*8+7-line] = color;
                             
                             // Palette B
                             color = colorTable[pixelColorIndex+32];
                             if (color.r==BLACK.r && color.g==BLACK.g && color.b==BLACK.b) 
                                 color = TRANSPARENT; 
                             characters1[s*256*64+c*64+col*8+7-line] = color;

                        } // for col
                    } // for line
                } // for plane
            } // for c

        } // for s
    }

    void doKey( KeyboardEvent e) {
      int pos=-1;
      switch ( e.keyCode ) {
        case 51: pos=0; break; // '3' for Coin
        case 49: pos=1; break; // '1' for Start 1
        case 50: pos=2; break; // '2' for Start 2
        case 32: pos=4; break; // Fire
        case 39: pos=5; break;   // Right
        case 37: pos=6; break;  // Left
        case 40: pos=7; break;  // down for Barrier
      }
      if (pos>=0) desiredGameControlForNextLoop[pos]=true;
    }

    /*
    bool doKey( int down, int ascii) {
      switch ( ascii ) {
        case 51:   gameControl[0]=1-down;    break; // '3' for Coin
        case 49:   gameControl[1]=1-down;    break; // '1' for Start 1
        case 50:   gameControl[2]=1-down;    break; // '2' for Start 2
        case 32 :   gameControl[4]=1-down;    break; // Fire
        case 'a': case 'A': if (down==0) this.autoFrameSkip = !autoFrameSkip; break;   // toggle auto frame skip
        case 's': case 'S': if (down==0) this.realSpeed = !realSpeed; setFrameSkip(1); break;   // toggle speed limiter
        case 'm': case 'M': if (down==0) this.mute = !mute; break;   // toggle speed limiter
        case 39:   gameControl[5]=1-down;   break;   // Right
        case 37:      gameControl[6]=1-down;  break;  // Left
        case 40:   gameControl[7]=1-down;    break;  // down for Barrier
        case 34:  setFrameSkip(getFrameSkip() - down);  // pgup 
            if ( getFrameSkip() < 1 ) setFrameSkip(1);             // Decrease frame skip
            break;
        case 33:  setFrameSkip(getFrameSkip() + down);       // pgdown Increase frame skip
            break;
          
        }
        return true;
    }
*/

  int getSleepTime() {
    return sleepTime;
  }

    void setFrameSkip(int fs) {
        this.frameSkip = fs;
    }

    int getFrameSkip() {
        return frameSkip;
    }


    double getFramesPerSecond() {
        return framesPerSecond;
    }


    void setAutoFrameSkip(afs) {
        this.autoFrameSkip = afs;
    }


    bool isAutoFrameSkip() {
        return autoFrameSkip;
    }


    void setRealSpeed(bool rs) {
        this.realSpeed = rs;
    }


    bool isRealSpeed() {
        return realSpeed;
    }


    void setMute(bool m) {
        this.mute = m;
    }


    bool isMute() {
        return mute;
    }
  
}
