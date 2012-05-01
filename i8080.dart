/**
 * Intel 8080 emulator. Based on the Z80 emulator written by 
 * Adam Davidson e Andrew Pollard for Jasper - Java Spectrum Emulator.
 */

class i8080 {

  static final int F_C = 0x01; // Carry
  static final int F_N = 0x02; // Bit 2
  static final int F_PV = 0x04; // Parity
  static final int F_3 = 0x08; // Bit 3
  static final int F_H = 0x10; // Half carry
  static final int F_5 = 0x20; // Bit 5
  static final int F_Z = 0x40; // Zero
  static final int F_S = 0x80; // Signal

  static final int PF = F_PV;
  static final int p_ = 0;

  
  var cyclesPerInterrupt;
  var cycles;
  var parity;

  int _A = 0, _HL = 0, _B = 0, _C = 0, _DE = 0;
  bool fS = false, fZ = false, f5 = false, fH = false;
  bool f3 = false, fPV = false, fN = false, fC = false;

  /**
   * Alternate registers: AF is register A + Flags.
   */

  int _AF_ = 0, _HL_ = 0, _BC_ = 0, _DE_ = 0;

  /** Stack Pointer e Program Counter */
  int _SP = 0, _PC = 0;

  /** Memory */
  var mem;
  
  
  i8080(double clockFrequencyInMHz) {
    cyclesPerInterrupt = ((clockFrequencyInMHz * 1e6) / 60).toInt();
    cycles = -cyclesPerInterrupt;
    mem = new List<int>(65536);
    parity = new List<bool>(256);
    Util.initializeIntList(mem);
    Util.initializeIntList(parity);
  }

  
  void initialize() {
    for (int i = 0; i < 256; i++) {
        bool p = true;
        for (int j = 0; j < 8; j++) {
            if ((i & (1 << j)) != 0) { // AND is true when we have at least one bit set to 1
                p = !p; 
            }
        }
        parity[i] = p;
    }
  }


  
  int AF() {
    return (A() << 8) | F();
  }

  void AF_param(int word) {
      A_param(word >> 8);
      F_param(word & 0xff);
  }


  int BC() {
    return (B() << 8) | C();
  }
  
  void BC_param(int word) {
      B_param(word >> 8);
      C_param(word & 0xff);
  }
  
  int DE() {
      return _DE;
  }
  
  void DE_param(int word) {
      _DE = word;
  }
  
  int HL() {
      return _HL;
  }
  
  void HL_param(int word) {
      _HL = word;
  }
  
  int PC() {
      return _PC;
  }
  
  void PC_param(int word) {
      _PC = word;
  }
  
  int SP() {
      return _SP;
  }
  
  void SP_param(int word) {
      _SP = word;
  }
  

  int F() {
    return (Sset() ? F_S : 0) | (Zset() ? F_Z : 0) | (f5 ? F_5 : 0)
            | (Hset() ? F_H : 0) | (f3 ? F_3 : 0) | (PVset() ? F_PV : 0)
            | (Nset() ? F_N : 0) | (Cset() ? F_C : 0);
  }
  
   void F_param(int bite) {
      fS = (bite & F_S) != 0;
      fZ = (bite & F_Z) != 0;
      f5 = (bite & F_5) != 0;
      fH = (bite & F_H) != 0;
      f3 = (bite & F_3) != 0;
      fPV = (bite & F_PV) != 0;
      fN = (bite & F_N) != 0;
      fC = (bite & F_C) != 0;
  }
  
   int A() {
      return _A;
  }
  
   void A_param(int bite) {
      _A = bite;
  }
  
   int B() {
      return _B;
  }
  
   void B_param(int bite) {
      _B = bite;
  }
  
   int C() {
      return _C;
  }
  
   void C_param(int bite) {
      _C = bite;
  }
  
   int D() {
      return (_DE >> 8);
  }
  
   void D_param(int bite) {
      _DE = (bite << 8) | (_DE & 0x00ff);
  }
  
   int E() {
      return (_DE & 0xff);
  }
  
   void E_param(int bite) {
      _DE = (_DE & 0xff00) | bite;
  }
  
   int H() {
      return (_HL >> 8);
  }
  
   void H_param(int bite) {
      _HL = (bite << 8) | (_HL & 0x00ff);
  }
  
   int L() {
      return (_HL & 0xff);
  }
  
   void L_param(int bite) {
      _HL = (_HL & 0xff00) | bite;
  }
  
   void setZ(bool f) {
      fZ = f;
  }
  
   void setC(bool f) {
      fC = f;
  }
  
   void setS(bool f) {
      fS = f;
  }
  
   void setH(bool f) {
      fH = f;
  }
  
   void setN(bool f) {
      fN = f;
  }
  
   void setPV(bool f) {
      fPV = f;
  }
  
   void set3(bool f) {
      f3 = f;
  }
  
   void set5(bool f) {
      f5 = f;
  }
  
   bool Zset() {
      return fZ;
  }
  
   bool Cset() {
      return fC;
  }
  
   bool Sset() {
      return fS;
  }
  
   bool Hset() {
      return fH;
  }
  
   bool Nset() {
      return fN;
  }
  
   bool PVset() {
      return fPV;
  }
  
   int peekb(int addr) {
     return mem[addr];
   }
  
   void pokeb(int addr, int newByte) {
       mem[addr] = newByte;
   }
  
   void pokew(int addr, int word) {
       pokeb(addr, word & 0xff);
       addr++;
       pokeb(addr & 0xffff, word >> 8);
   }
  
   int peekw(int addr) {
       int t = peekb(addr);
       addr++;
       return t | (peekb(addr & 0xffff) << 8);
   }
  
    void pushw(int word) {
       int sp = ((SP() - 2) & 0xffff);
       SP_param(sp);
       pokew(sp, word);
   }
  
    int popw() {
       int sp = SP();
       int t = peekb(sp);
       sp++;
       t |= (peekb(sp & 0xffff) << 8);
       SP_param(++sp & 0xffff);
       return t;
   }
  
    void pushpc() {
       pushw(PC());
   }
  
    void poppc() {
       PC_param(popw());
   }

    int nxtpcb() {
      int pc = PC();
      int t = peekb(pc);
      PC_param(++pc & 0xffff);
      return t;
    }
  
    int nxtpcw() {
        int pc = PC();
        int t = peekb(pc);
        t |= (peekb(++pc & 0xffff) << 8);
        PC_param(++pc & 0xffff);
        return t;
    }
  
    void reset() {
        PC_param(0);
        SP_param(0);
        A_param(0);
        F_param(0);
        BC_param(0);
        DE_param(0);
        HL_param(0);
    }
  
    void outb(int port, int bite) {
    }
  
    int inb(int port) {
        return 0xff;
    }
  
    int interrupt() {
        return (0);
    }


    /** i8080 fetch/execute loop */
     void execute() {
        switch (nxtpcb()) {

            case 0: /* NOP */
            {
                break;
            }

                /* LXI rr,D16 / DAD rr */

            case 1: /* LXI B,D16 */
            {
                BC_param(nxtpcw());
                break;
            }
            case 9: /* DAD B */
            {
                HL_param(add16(HL(), BC()));
                break;
            }
            case 17: /* LXI D,D16 */
            {
                DE_param(nxtpcw());
                break;
            }
            case 25: /* DAD D */
            {
                HL_param(add16(HL(), DE()));
                break;
            }
            case 33: /* LXI H,D16 */
            {
                HL_param(nxtpcw());
                break;
            }
            case 41: /* DAD H */
            {
                int hl = HL();
                HL_param(add16(hl, hl));
                break;
            }
            case 49: /* LXI SP,D16 */
            {
                SP_param(nxtpcw());
                break;
            }
            case 57: /* DAD SP */
            {
                HL_param(add16(HL(), SP()));
                break;
            }

                /* MOV (**),A/A,(**) */
            case 2: /* STAX B */
            {
                pokeb(BC(), A());
                break;
            }
            case 10: /* LDAX B */
            {
                A_param(peekb(BC()));
                break;
            }
            case 18: /* STAX D */
            {
                pokeb(DE(), A());
                break;
            }
            case 26: /* LDAX D */
            {
                A_param(peekb(DE()));
                break;
            }
            case 34: /* SHLD Addr */
            {
                pokew(nxtpcw(), HL());
                break;
            }
            case 42: /* LHLD Addr */
            {
                HL_param(peekw(nxtpcw()));
                break;
            }
            case 50: /* STA Addr */
            {
                pokeb(nxtpcw(), A());
                break;
            }
            case 58: /* LDA Addr */
            {
                A_param(peekb(nxtpcw()));
                break;
            }

                /* INX/DCX */
            case 3: /* INX B */
            {
                BC_param(inc16(BC()));
                break;
            }
            case 11: /* DCX B */
            {
                BC_param(dec16(BC()));
                break;
            }
            case 19: /* INX D */
            {
                DE_param(inc16(DE()));
                break;
            }
            case 27: /* DCX D */
            {
                DE_param(dec16(DE()));
                break;
            }
            case 35: /* INX H */
            {
                HL_param(inc16(HL()));
                break;
            }
            case 43: /* DCX H */
            {
                HL_param(dec16(HL()));
                break;
            }
            case 51: /* INX SP */
            {
                SP_param(inc16(SP()));
                break;
            }
            case 59: /* DCX SP */
            {
                SP_param(dec16(SP()));
                break;
            }

                /* INR * */
            case 4: /* INR B */
            {
                B_param(inc8(B()));
                break;
            }
            case 12: /* INR C */
            {
                C_param(inc8(C()));
                break;
            }
            case 20: /* INR D */
            {
                D_param(inc8(D()));
                break;
            }
            case 28: /* INR E */
            {
                E_param(inc8(E()));
                break;
            }
            case 36: /* INR H */
            {
                H_param(inc8(H()));
                break;
            }
            case 44: /* INR L */
            {
                L_param(inc8(L()));
                break;
            }
            case 52: /* INR M */
            {
                int hl = HL();
                pokeb(hl, inc8(peekb(hl)));
                break;
            }
            case 60: /* INR A */
            {
                A_param(inc8(A()));
                break;
            }

                /* DCR * */
            case 5: /* DCR B */
            {
                B_param(dec8(B()));
                break;
            }
            case 13: /* DCR C */
            {
                C_param(dec8(C()));
                break;
            }
            case 21: /* DCR D */
            {
                D_param(dec8(D()));
                break;
            }
            case 29: /* DCR E */
            {
                E_param(dec8(E()));
                break;
            }
            case 37: /* DCR H */
            {
                H_param(dec8(H()));
                break;
            }
            case 45: /* DCR L */
            {
                L_param(dec8(L()));
                break;
            }
            case 53: /* DCR M */
            {
                int hl = HL();
                pokeb(hl, dec8(peekb(hl)));
                break;
            }
            case 61: /* DCR A() */
            {
                A_param(dec8(A()));
                break;
            }

                /* MVI *,D8 */
            case 6: /* MVI B,D8 */
            {
                B_param(nxtpcb());
                break;
            }
            case 14: /* MVI C,D8 */
            {
                C_param(nxtpcb());
                break;
            }
            case 22: /* MVI D,D8 */
            {
                D_param(nxtpcb());
                break;
            }
            case 30: /* MVI E,D8 */
            {
                E_param(nxtpcb());
                break;
            }
            case 38: /* MVI H,D8 */
            {
                H_param(nxtpcb());
                break;
            }
            case 46: /* MVI L,D8 */
            {
                L_param(nxtpcb());
                break;
            }
            case 54: /* MVI M,D8 */
            {
                pokeb(HL(), nxtpcb());

                break;
            }
            case 62: /* MVI A,D8 */
            {
                A_param(nxtpcb());
                break;
            }

                /* R** */
            case 7: /* RLC */
            {
                rlc();
                break;
            }
            case 15: /* RRC */
            {
                rrc();
                break;
            }
            case 23: /* RAL */
            {
                ral();
                break;
            }
            case 31: /* RAR */
            {
                rar();
                break;
            }
            case 39: /* DAA */
            {
                daa();
                break;
            }
            case 47: /* CMA */
            {
                cma();
                break;
            }
            case 55: /* STC */
            {
                stc();
                break;
            }
            case 63: /* CMC */
            {
                cmc();
                break;
            }

                /* MOV B,* */
            case 64: /* MOV B,B */
            {
                break;
            }
            case 65: /* MOV B,c */
            {
                B_param(C());
                break;
            }
            case 66: /* MOV B,D */
            {
                B_param(D());
                break;
            }
            case 67: /* MOV B,E */
            {
                B_param(E());
                break;
            }
            case 68: /* MOV B,H */
            {
                B_param(H());
                break;
            }
            case 69: /* MOV B,L */
            {
                B_param(L());
                break;
            }
            case 70: /* MOV B,M */
            {
                B_param(peekb(HL()));
                break;
            }
            case 71: /* MOV B,A */
            {
                B_param(A());
                break;
            }

                /* MOV C,* */
            case 72: /* MOV C,B */
            {
                C_param(B());
                break;
            }
            case 73: /* MOV C,C */
            {
                break;
            }
            case 74: /* MOV C,D */
            {
                C_param(D());
                break;
            }
            case 75: /* MOV C,E */
            {
                C_param(E());
                break;
            }
            case 76: /* MOV C,H */
            {
                C_param(H());
                break;
            }
            case 77: /* MOV C,L */
            {
                C_param(L());
                break;
            }
            case 78: /* MOV C,M */
            {
                C_param(peekb(HL()));
                break;
            }
            case 79: /* MOV C,A */
            {
                C_param(A());
                break;
            }

                /* MOV D,* */
            case 80: /* MOV D,B */
            {
                D_param(B());
                break;
            }
            case 81: /* MOV D,C */
            {
                D_param(C());
                break;
            }
            case 82: /* MOV D,D */
            {
                break;
            }
            case 83: /* MOV D,E */
            {
                D_param(E());
                break;
            }
            case 84: /* MOV D,H */
            {
                D_param(H());
                break;
            }
            case 85: /* MOV D,L */
            {
                D_param(L());
                break;
            }
            case 86: /* MOV D,M */
            {
                D_param(peekb(HL()));
                break;
            }
            case 87: /* MOV D,A */
            {
                D_param(A());
                break;
            }

                /* MOV E,* */
            case 88: /* MOV E,B */
            {
                E_param(B());
                break;
            }
            case 89: /* MOV E,C */
            {
                E_param(C());
                break;
            }
            case 90: /* MOV E,D */
            {
                E_param(D());
                break;
            }
            case 91: /* MOV E,E */
            {
                break;
            }
            case 92: /* MOV E,H */
            {
                E_param(H());
                break;
            }
            case 93: /* MOV E,L */
            {
                E_param(L());
                break;
            }
            case 94: /* MOV E,M */
            {
                E_param(peekb(HL()));
                break;
            }
            case 95: /* MOV E,A */
            {
                E_param(A());
                break;
            }

                /* MOV H,* */
            case 96: /* MOV H,B */
            {
                H_param(B());
                break;
            }
            case 97: /* MOV H,C */
            {
                H_param(C());
                break;
            }
            case 98: /* MOV H,D */
            {
                H_param(D());
                break;
            }
            case 99: /* MOV H,E */
            {
                H_param(E());
                break;
            }
            case 100: /* MOV H,H */
            {
                break;
            }
            case 101: /* MOV H,L */
            {
                H_param(L());
                break;
            }
            case 102: /* MOV H,M */
            {
                H_param(peekb(HL()));
                break;
            }
            case 103: /* MOV H,A */
            {
                H_param(A());
                break;
            }

                /* MOV L,* */
            case 104: /* MOV L,B */
            {
                L_param(B());
                break;
            }
            case 105: /* MOV L,C */
            {
                L_param(C());
                break;
            }
            case 106: /* MOV L,D */
            {
                L_param(D());
                break;
            }
            case 107: /* MOV L,E */
            {
                L_param(E());
                break;
            }
            case 108: /* MOV L,H */
            {
                L_param(H());
                break;
            }
            case 109: /* MOV L,L */
            {
                break;
            }
            case 110: /* MOV L,M */
            {
                L_param(peekb(HL()));
                break;
            }
            case 111: /* MOV L,A */
            {
                L_param(A());
                break;
            }

                /* MOV M,* */
            case 112: /* MOV M,B */
            {
                pokeb(HL(), B());
                break;
            }
            case 113: /* MOV M,C */
            {
                pokeb(HL(), C());
                break;
            }
            case 114: /* MOV M,D */
            {
                pokeb(HL(), D());
                break;
            }
            case 115: /* MOV M,E */
            {
                pokeb(HL(), E());
                break;
            }
            case 116: /* MOV M,H */
            {
                pokeb(HL(), H());
                break;
            }
            case 117: /* MOV M,L */
            {
                pokeb(HL(), L());
                break;
            }
            case 118: /* HALT */
            {
                break;
            }
            case 119: /* MOV M,A */
            {
                pokeb(HL(), A());
                break;
            }

                /* MOV A,* */
            case 120: /* MOV A,B */
            {
                A_param(B());
                break;
            }
            case 121: /* MOV A,C */
            {
                A_param(C());
                break;
            }
            case 122: /* MOV A,D */
            {
                A_param(D());
                break;
            }
            case 123: /* MOV A,E */
            {
                A_param(E());
                break;
            }
            case 124: /* MOV A,H */
            {
                A_param(H());
                break;
            }
            case 125: /* MOV A,L */
            {
                A_param(L());
                break;
            }
            case 126: /* MOV A,M */
            {
                A_param(peekb(HL()));
                break;
            }
            case 127: /* MOV A,A */
            {
                break;
            }

                /* ADD * */
            case 128: /* ADD B */
            {
                add_a(B());
                break;
            }
            case 129: /* ADD C */
            {
                add_a(C());
                break;
            }
            case 130: /* ADD D */
            {
                add_a(D());
                break;
            }
            case 131: /* ADD E */
            {
                add_a(E());
                break;
            }
            case 132: /* ADD H */
            {
                add_a(H());
                break;
            }
            case 133: /* ADD L */
            {
                add_a(L());
                break;
            }
            case 134: /* ADD M */
            {
                add_a(peekb(HL()));
                break;
            }
            case 135: /* ADD A */
            {
                add_a(A());
                break;
            }

                /* ADC * */
            case 136: /* ADC B */
            {
                adc_a(B());
                break;
            }
            case 137: /* ADC C */
            {
                adc_a(C());
                break;
            }
            case 138: /* ADC D */
            {
                adc_a(D());
                break;
            }
            case 139: /* ADC E */
            {
                adc_a(E());
                break;
            }
            case 140: /* ADC H */
            {
                adc_a(H());
                break;
            }
            case 141: /* ADC L */
            {
                adc_a(L());
                break;
            }
            case 142: /* ADC M */
            {
                adc_a(peekb(HL()));
                break;
            }
            case 143: /* ADC A */
            {
                adc_a(A());
                break;
            }

                /* SUB * */
            case 144: /* SUB B */
            {
                sub_a(B());
                break;
            }
            case 145: /* SUB C */
            {
                sub_a(C());
                break;
            }
            case 146: /* SUB D */
            {
                sub_a(D());
                break;
            }
            case 147: /* SUB E */
            {
                sub_a(E());
                break;
            }
            case 148: /* SUB H */
            {
                sub_a(H());
                break;
            }
            case 149: /* SUB L */
            {
                sub_a(L());
                break;
            }
            case 150: /* SUB M */
            {
                sub_a(peekb(HL()));
                break;
            }
            case 151: /* SUB A() */
            {
                sub_a(A());
                break;
            }

                /* SBB A */
            case 152: /* SBB B */
            {
                sbc_a(B());
                break;
            }
            case 153: /* SBB C */
            {
                sbc_a(C());
                break;
            }
            case 154: /* SBB D */
            {
                sbc_a(D());
                break;
            }
            case 155: /* SBB E */
            {
                sbc_a(E());
                break;
            }
            case 156: /* SBB H */
            {
                sbc_a(H());
                break;
            }
            case 157: /* SBB L */
            {
                sbc_a(L());
                break;
            }
            case 158: /* SBB M */
            {
                sbc_a(peekb(HL()));
                break;
            }
            case 159: /* SBB A */
            {
                sbc_a(A());
                break;
            }

                /* ANA * */
            case 160: /* ANA B */
            {
                and_a(B());
                break;
            }
            case 161: /* ANA C */
            {
                and_a(C());
                break;
            }
            case 162: /* ANA D */
            {
                and_a(D());
                break;
            }
            case 163: /* ANA E */
            {
                and_a(E());
                break;
            }
            case 164: /* ANA H */
            {
                and_a(H());
                break;
            }
            case 165: /* ANA L */
            {
                and_a(L());
                break;
            }
            case 166: /* ANA M */
            {
                and_a(peekb(HL()));
                break;
            }
            case 167: /* ANA A */
            {
                and_a(A());
                break;
            }

                /* XRA * */
            case 168: /* XRA B */
            {
                xor_a(B());
                break;
            }
            case 169: /* XRA C */
            {
                xor_a(C());
                break;
            }
            case 170: /* XRA D */
            {
                xor_a(D());
                break;
            }
            case 171: /* XRA E */
            {
                xor_a(E());
                break;
            }
            case 172: /* XRA H */
            {
                xor_a(H());
                break;
            }
            case 173: /* XRA L */
            {
                xor_a(L());
                break;
            }
            case 174: /* XRA M */
            {
                xor_a(peekb(HL()));
                break;
            }
            case 175: /* XRA A() */
            {
                xor_a(A());
                break;
            }

                /* ORA * */
            case 176: /* ORA B */
            {
                or_a(B());
                break;
            }
            case 177: /* ORA C */
            {
                or_a(C());
                break;
            }
            case 178: /* ORA D */
            {
                or_a(D());
                break;
            }
            case 179: /* ORA E */
            {
                or_a(E());
                break;
            }
            case 180: /* ORA H */
            {
                or_a(H());
                break;
            }
            case 181: /* ORA L */
            {
                or_a(L());
                break;
            }
            case 182: /* ORA M */
            {
                or_a(peekb(HL()));
                break;
            }
            case 183: /* ORA A() */
            {
                or_a(A());
                break;
            }

                /* CMP * */
            case 184: /* CMP B */
            {
                cp_a(B());
                break;
            }
            case 185: /* CMP C */
            {
                cp_a(C());
                break;
            }
            case 186: /* CMP D */
            {
                cp_a(D());
                break;
            }
            case 187: /* CMP E */
            {
                cp_a(E());
                break;
            }
            case 188: /* CMP H */
            {
                cp_a(H());
                break;
            }
            case 189: /* CMP L */
            {
                cp_a(L());
                break;
            }
            case 190: /* CMP M */
            {
                cp_a(peekb(HL()));
                break;
            }
            case 191: /* CMP A() */
            {
                cp_a(A());
                break;
            }

                /* Rcc */
            case 192: /* RNZ */
            {
                if (!Zset()) {
                    poppc();

                } else {

                }
                break;
            }
            case 200: /* RZ */
            {
                if (Zset()) {
                    poppc();

                } else {

                }
                break;
            }
            case 208: /* RNC */
            {
                if (!Cset()) {
                    poppc();

                } else {

                }
                break;
            }
            case 216: /* RC */
            {
                if (Cset()) {
                    poppc();

                } else {

                }
                break;
            }
            case 224: /* RPO */
            {
                if (!PVset()) {
                    poppc();

                } else {

                }
                break;
            }
            case 232: /* RPE */
            {
                if (PVset()) {
                    poppc();

                } else {

                }
                break;
            }
            case 240: /* RP */
            {
                if (!Sset()) {
                    poppc();

                } else {

                }
                break;
            }
            case 248: /* RM */
            {
                if (Sset()) {
                    poppc();

                } else {

                }
                break;
            }

                /* POP * */
            case 193: /* POP B */
            {
                BC_param(popw());
                break;
            }
            case 201: /* RET */
            {
                poppc();
                break;
            }
            case 209: /* POP D */
            {
                DE_param(popw());
                break;
            }
            case 225: /* POP H */
            {
                HL_param(popw());
                break;
            }
            case 233: /* PCHL */
            {
                PC_param(HL());
                break;
            }
            case 241: /* POP PSW */
            {
                AF_param(popw());
                break;
            }
            case 249: /* SPHL */
            {
                SP_param(HL());
                break;
            }

                /* Jcc Addr */
            case 194: /* JNZ Addr */
            {
                if (!Zset()) {
                    PC_param(nxtpcw());
                } else {
                    PC_param((PC() + 2) & 0xffff);
                }

                break;
            }
            case 202: /* JZ Addr */
            {
                if (Zset()) {
                    PC_param(nxtpcw());
                } else {
                    PC_param((PC() + 2) & 0xffff);
                }

                break;
            }
            case 210: /* JNC Addr */
            {
                if (!Cset()) {
                    PC_param(nxtpcw());
                } else {
                    PC_param((PC() + 2) & 0xffff);
                }

                break;
            }
            case 218: /* JC Addr */
            {
                if (Cset()) {
                    PC_param(nxtpcw());
                } else {
                    PC_param((PC() + 2) & 0xffff);
                }

                break;
            }
            case 226: /* JPO Addr */
            {
                if (!PVset()) {
                    PC_param(nxtpcw());
                } else {
                    PC_param((PC() + 2) & 0xffff);
                }

                break;
            }
            case 234: /* JPE Addr */
            {
                if (PVset()) {
                    PC_param(nxtpcw());
                } else {
                    PC_param((PC() + 2) & 0xffff);
                }

                break;
            }
            case 242: /* JP Addr */
            {
                if (!Sset()) {
                    PC_param(nxtpcw());
                } else {
                    PC_param((PC() + 2) & 0xffff);
                }

                break;
            }
            case 250: /* JM Addr */
            {
                if (Sset()) {
                    PC_param(nxtpcw());
                } else {
                    PC_param((PC() + 2) & 0xffff);
                }

                break;
            }

                /* Various */
            case 195: /* JMP Addr */
            {
                PC_param(peekw(PC()));
                break;
            }

            case 211: /* OUT D8 */
            {
                outb(nxtpcb(), A());

                break;
            }
            case 219: /* IN D8 */
            {
                A_param(inb((A() << 8) | nxtpcb()));

                break;
            }
            case 227: /* XTHL */
            {
                int t = HL();
                int sp = SP();
                HL_param(peekw(sp));
                pokew(sp, t);

                break;
            }
            case 235: /* XCHG */
            {
                int t = HL();
                HL_param(DE());
                DE_param(t);

                break;
            }
            case 243: /* DI */
            {
                break;
            }
            case 251: /* EI */
            {
                break;
            }

                /* Ccc Addr */
            case 196: /* CNZ Addr */
            {
                if (!Zset()) {
                    int t = nxtpcw();
                    pushpc();
                    PC_param(t);

                } else {
                    PC_param((PC() + 2) & 0xffff);

                }
                break;
            }
            case 204: /* CZ Addr */
            {
                if (Zset()) {
                    int t = nxtpcw();
                    pushpc();
                    PC_param(t);

                } else {
                    PC_param((PC() + 2) & 0xffff);

                }
                break;
            }
            case 212: /* CNC Addr */
            {
                if (!Cset()) {
                    int t = nxtpcw();
                    pushpc();
                    PC_param(t);

                } else {
                    PC_param((PC() + 2) & 0xffff);

                }
                break;
            }
            case 220: /* CC Addr */
            {
                if (Cset()) {
                    int t = nxtpcw();
                    pushpc();
                    PC_param(t);

                } else {
                    PC_param((PC() + 2) & 0xffff);

                }
                break;
            }
            case 228: /* CPO Addr */
            {
                if (!PVset()) {
                    int t = nxtpcw();
                    pushpc();
                    PC_param(t);

                } else {
                    PC_param((PC() + 2) & 0xffff);

                }
                break;
            }
            case 236: /* CPE Addr */
            {
                if (PVset()) {
                    int t = nxtpcw();
                    pushpc();
                    PC_param(t);

                } else {
                    PC_param((PC() + 2) & 0xffff);

                }
                break;
            }
            case 244: /* CP Addr */
            {
                if (!Sset()) {
                    int t = nxtpcw();
                    pushpc();
                    PC_param(t);

                } else {
                    PC_param((PC() + 2) & 0xffff);

                }
                break;
            }
            case 252: /* CM Addr */
            {
                if (Sset()) {
                    int t = nxtpcw();
                    pushpc();
                    PC_param(t);

                } else {
                    PC_param((PC() + 2) & 0xffff);

                }
                break;
            }

                /* PUSH * */
            case 197: /* PUSH B */
            {
                pushw(BC());
                break;
            }
            case 205: /* CALL Addr */
            {
                int t = nxtpcw();
                pushpc();
                PC_param(t);

                break;
            }
            case 213: /* PUSH D */
            {
                pushw(DE());
                break;
            }
            case 229: /* PUSH H */
            {
                pushw(HL());
                break;
            }
            case 245: /* PUSH PSW */
            {
                pushw(AF());
                break;
            }

                /* op N */
            case 198: /* ADD N */
            {
                add_a(nxtpcb());
                break;
            }
            case 206: /* ADC N */
            {
                adc_a(nxtpcb());
                break;
            }
            case 214: /* SUB N */
            {
                sub_a(nxtpcb());
                break;
            }
            case 222: /* SBB N */
            {
                sbc_a(nxtpcb());
                break;
            }
            case 230: /* AND N */
            {
                and_a(nxtpcb());
                break;
            }
            case 238: /* XRI N */
            {
                xor_a(nxtpcb());
                break;
            }
            case 246: /* ORA N */
            {
                or_a(nxtpcb());
                break;
            }
            case 254: /* CPI N */
            {
                cp_a(nxtpcb());
                break;
            }

                /* RST n */
            case 199: /* RST 0 */
            {
                pushpc();
                PC_param(0);
                break;
            }
            case 207: /* RST 8 */
            {
                pushpc();
                PC_param(8);
                break;
            }
            case 215: /* RST 16 */
            {
                pushpc();
                PC_param(16);
                break;
            }
            case 223: /* RST 24 */
            {
                pushpc();
                PC_param(24);
                break;
            }
            case 231: /* RST 32 */
            {
                pushpc();
                PC_param(32);
                break;
            }
            case 239: /* RST 40 */
            {
                pushpc();
                PC_param(40);
                break;
            }
            case 247: /* RST 48 */
            {
                pushpc();
                PC_param(48);
                break;
            }
            case 255: /* RST 56 */
            {
                pushpc();
                PC_param(56);
                break;
            }

        }

    }

    /** Add with carry - alters all flags */
    void adc_a(int b) {
        int a = A();
        int c = Cset() ? 1 : 0;
        int wans = a + b + c;
        int ans = wans & 0xff;

        setS((ans & F_S) != 0);
        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setZ((ans) == 0);
        setC((wans & 0x100) != 0);
        setPV(((a ^ ~b) & (a ^ ans) & 0x80) != 0);
        setH((((a & 0x0f) + (b & 0x0f) + c) & F_H) != 0);
        setN(false);

        A_param(ans);
    }

    /** Add - alters all flags */
    void add_a(int b) {
        int a = A();
        int wans = a + b;
        int ans = wans & 0xff;

        setS((ans & F_S) != 0);
        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setZ((ans) == 0);
        setC((wans & 0x100) != 0);
        setPV(((a ^ ~b) & (a ^ ans) & 0x80) != 0);
        setH((((a & 0x0f) + (b & 0x0f)) & F_H) != 0);
        setN(false);

        A_param(ans);
    }

    /** Subtract with carry - alters all flags */
    void sbc_a(int b) {
        int a = A();
        int c = Cset() ? 1 : 0;
        int wans = a - b - c;
        int ans = wans & 0xff;

        setS((ans & F_S) != 0);
        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setZ((ans) == 0);
        setC((wans & 0x100) != 0);
        setPV(((a ^ b) & (a ^ ans) & 0x80) != 0);
        setH((((a & 0x0f) - (b & 0x0f) - c) & F_H) != 0);
        setN(true);

        A_param(ans);
    }

    /** Subtract - alters all flags */
    void sub_a(int b) {
        int a = A();
        int wans = a - b;
        int ans = wans & 0xff;

        setS((ans & F_S) != 0);
        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setZ((ans) == 0);
        setC((wans & 0x100) != 0);
        setPV(((a ^ b) & (a ^ ans) & 0x80) != 0);
        setH((((a & 0x0f) - (b & 0x0f)) & F_H) != 0);
        setN(true);

        A_param(ans);
    }

    /** Rotate Left - alters H N C 3 5 flags */
    void rlc() {
        int ans = A();
        bool c = (ans & 0x80) != 0;

        if (c) {
            ans = (ans << 1) | 0x01;
        } else {
            ans <<= 1;
        }
        ans &= 0xff;

        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setN(false);
        setH(false);
        setC(c);

        A_param(ans);
    }

    /** Rotate Right - alters H N C 3 5 flags */
    void rrc() {
        int ans = A();
        bool c = (ans & 0x01) != 0;

        if (c) {
            ans = (ans >> 1) | 0x80;
        } else {
            ans >>= 1;
        }

        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setN(false);
        setH(false);
        setC(c);

        A_param(ans);
    }

    /** Rotate Left through Carry - alters H N C 3 5 flags */
    void ral() {
        int ans = A();
        bool c = (ans & 0x80) != 0;

        if (Cset()) {
            ans = (ans << 1) | 0x01;
        } else {
            ans <<= 1;
        }

        ans &= 0xff;

        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setN(false);
        setH(false);
        setC(c);

        A_param(ans);
    }

    /** Rotate Right through Carry - alters H N C 3 5 flags */
    void rar() {
        int ans = A();
        bool c = (ans & 0x01) != 0;

        if (Cset()) {
            ans = (ans >> 1) | 0x80;
        } else {
            ans >>= 1;
        }

        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setN(false);
        setH(false);
        setC(c);

        A_param(ans);
    }

    /** Compare - alters all flags */
    void cp_a(int b) {
        int a = A();
        int wans = a - b;
        int ans = wans & 0xff;

        setS((ans & F_S) != 0);
        set3((b & F_3) != 0);
        set5((b & F_5) != 0);
        setN(true);
        setZ(ans == 0);
        setC((wans & 0x100) != 0);
        setH((((a & 0x0f) - (b & 0x0f)) & F_H) != 0);
        setPV(((a ^ b) & (a ^ ans) & 0x80) != 0);
    }

    /** Bitwise and - alters all flags */
    void and_a(int b) {
        int ans = A() & b;

        setS((ans & F_S) != 0);
        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setH(true);
        setPV(parity[ans]);
        setZ(ans == 0);
        setN(false);
        setC(false);

        A_param(ans);
    }

    /** Bitwise or - alters all flags */
    void or_a(int b) {
        int ans = A() | b;

        setS((ans & F_S) != 0);
        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setH(false);
        setPV(parity[ans]);
        setZ(ans == 0);
        setN(false);
        setC(false);

        A_param(ans);
    }

    /** Bitwise exclusive or - alters all flags */
    void xor_a(int b) {
        int ans = (A() ^ b) & 0xff;

        setS((ans & F_S) != 0);
        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setH(false);
        setPV(parity[ans]);
        setZ(ans == 0);
        setN(false);
        setC(false);

        A_param(ans);
    }

    /** One's complement - alters N H 3 5 flags */
    void cma() {
        int ans = A() ^ 0xff;

        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setH(true);
        setN(true);

        A_param(ans);
    }

    /** Decimal Adjust Accumulator - alters all flags */
    void daa() {
        int ans = A();
        int incr = 0;
        bool carry = Cset();

        if ((Hset()) || ((ans & 0x0f) > 0x09)) {
            incr |= 0x06;
        }
        if (carry || (ans > 0x9f) || ((ans > 0x8f) && ((ans & 0x0f) > 0x09))) {
            incr |= 0x60;
        }
        if (ans > 0x99) {
            carry = true;
        }
        if (Nset()) {
            sub_a(incr);
        } else {
            add_a(incr);
        }

        ans = A();

        setC(carry);
        setPV(parity[ans]);
    }

    /** Set carry flag - alters N H 3 5 C flags */
    void stc() {
        int ans = A();

        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setN(false);
        setH(false);
        setC(true);
    }

    /** Complement carry flag - alters N 3 5 C flags */
    void cmc() {
        int ans = A();

        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setN(false);
        setC(Cset() ? false : true);
    }

    /** Rotate left - alters all flags */
    int rlc_param(int ans) {
        bool c = (ans & 0x80) != 0;

        if (c) {
            ans = (ans << 1) | 0x01;
        } else {
            ans <<= 1;
        }
        ans &= 0xff;

        setS((ans & F_S) != 0);
        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setZ((ans) == 0);
        setPV(parity[ans]);
        setH(false);
        setN(false);
        setC(c);

        return (ans);
    }

    /** Rotate right - alters all flags */
    int rrc_param(int ans) {
        bool c = (ans & 0x01) != 0;

        if (c) {
            ans = (ans >> 1) | 0x80;
        } else {
            ans >>= 1;
        }

        setS((ans & F_S) != 0);
        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setZ((ans) == 0);
        setPV(parity[ans]);
        setH(false);
        setN(false);
        setC(c);

        return (ans);
    }

    /** Rotate left through carry - alters all flags */
    int rl(int ans) {
        bool c = (ans & 0x80) != 0;

        if (Cset()) {
            ans = (ans << 1) | 0x01;
        } else {
            ans <<= 1;
        }
        ans &= 0xff;

        setS((ans & F_S) != 0);
        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setZ((ans) == 0);
        setPV(parity[ans]);
        setH(false);
        setN(false);
        setC(c);

        return (ans);
    }

    /** Rotate right through carry - alters all flags */
    int rr(int ans) {
        bool c = (ans & 0x01) != 0;

        if (Cset()) {
            ans = (ans >> 1) | 0x80;
        } else {
            ans >>= 1;
        }

        setS((ans & F_S) != 0);
        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setZ((ans) == 0);
        setPV(parity[ans]);
        setH(false);
        setN(false);
        setC(c);

        return (ans);
    }

    /** Decrement - alters all but C flag */
    int dec8(int ans) {
        bool pv = (ans == 0x80);
        bool h = (((ans & 0x0f) - 1) & F_H) != 0;
        ans = (ans - 1) & 0xff;

        setS((ans & F_S) != 0);
        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setZ((ans) == 0);
        setPV(pv);
        setH(h);
        setN(true);

        return (ans);
    }

    /** Increment - alters all but C flag */
    int inc8(int ans) {
        bool pv = (ans == 0x7f);
        bool h = (((ans & 0x0f) + 1) & F_H) != 0;
        ans = (ans + 1) & 0xff;

        setS((ans & F_S) != 0);
        set3((ans & F_3) != 0);
        set5((ans & F_5) != 0);
        setZ((ans) == 0);
        setPV(pv);
        setH(h);
        setN(false);

        return (ans);
    }

    /** Add with carry */
    int adc16(int a, int b) {
        int c = Cset() ? 1 : 0;
        int lans = a + b + c;
        int ans = lans & 0xffff;

        setS((ans & (F_S << 8)) != 0);
        set3((ans & (F_3 << 8)) != 0);
        set5((ans & (F_5 << 8)) != 0);
        setZ((ans) == 0);
        setC((lans & 0x10000) != 0);
        setPV(((a ^ ~b) & (a ^ ans) & 0x8000) != 0);
        setH((((a & 0x0fff) + (b & 0x0fff) + c) & 0x1000) != 0);
        setN(false);

        return (ans);
    }

    /** Add */
    int add16(int a, int b) {
        int lans = a + b;
        int ans = lans & 0xffff;

        set3((ans & (F_3 << 8)) != 0);
        set5((ans & (F_5 << 8)) != 0);
        setC((lans & 0x10000) != 0);
        setH((((a & 0x0fff) + (b & 0x0fff)) & 0x1000) != 0);
        setN(false);

        return (ans);
    }

    /** Add with carry */
    int sbc16(int a, int b) {
        int c = Cset() ? 1 : 0;
        int lans = a - b - c;
        int ans = lans & 0xffff;

        setS((ans & (F_S << 8)) != 0);
        set3((ans & (F_3 << 8)) != 0);
        set5((ans & (F_5 << 8)) != 0);
        setZ((ans) == 0);
        setC((lans & 0x10000) != 0);
        setPV(((a ^ b) & (a ^ ans) & 0x8000) != 0);
        setH((((a & 0x0fff) - (b & 0x0fff) - c) & 0x1000) != 0);
        setN(true);

        return (ans);
    }

    /** Quick Increment : no flags */
    static int inc16(int a) {
        return (a + 1) & 0xffff;
    }

    static int qinc8(int a) {
        return (a + 1) & 0xff;
    }

    /** Quick Decrement : no flags */
    static int dec16(int a) {
        return (a - 1) & 0xffff;
    }

    static int qdec8(int a) {
        return (a - 1) & 0xff;
    }

    /** Bit toggling */
    static int res(int bit, int val) {
        return val & ~bit;
    }

    static int set(int bit, int val) {
        return val | bit;
    }
}
