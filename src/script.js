/*
 * 6502.js
 * A 6502 CPU Emulator
 */

// 6502 CPU Class
class Olc6502 {
  // Variable length instructions
  //  - Instruction can be 1-3 bytes long
  //  - Clock cycles required per instriction can vary
  //  - First byte can tell us the size, adressing mode and number of cycles required
  //  - Each instruction can have multiple addressing modes
  constructor() {
    this.fetched = 0b00000000;  // Represents the byte we fetched
    this.addrAbs = 0b0000000000000000;  // Represents a full 16-bit address
    this.addrRel = 0b0000000000000000;  // Represents a relative address
    this.opcode = 0b00000000;  // Represents the current opcode
    this.cycles = 0;  // Represents the number of cycles the current instruction requires

    /**
     * An array of Instruction objects.
     * @type {Array<Instruction>}
     */
    this.lookup = [
      { name: "BRK", addrMode: "IMM", opcode: 0x00, cycles: 7 }, { name: "ORA", addrMode: "IZX", opcode: 0x01, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x02, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x03, cycles: 8 }, { name: "???", addrMode: "IMP", opcode: 0x04, cycles: 3 }, { name: "ORA", addrMode: "ZP0", opcode: 0x05, cycles: 3 }, { name: "ASL", addrMode: "ZP0", opcode: 0x06, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0x07, cycles: 5 }, { name: "PHP", addrMode: "IMP", opcode: 0x08, cycles: 3 }, { name: "ORA", addrMode: "IMM", opcode: 0x09, cycles: 2 }, { name: "ASL", addrMode: "IMP", opcode: 0x0A, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x0B, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x0C, cycles: 4 }, { name: "ORA", addrMode: "ABS", opcode: 0x0D, cycles: 4 }, { name: "ASL", addrMode: "ABS", opcode: 0x0E, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x0F, cycles: 6 },
      { name: "BPL", addrMode: "REL", opcode: 0x10, cycles: 2 }, { name: "ORA", addrMode: "IZY", opcode: 0x11, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0x12, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x13, cycles: 8 }, { name: "???", addrMode: "IMP", opcode: 0x14, cycles: 4 }, { name: "ORA", addrMode: "ZPX", opcode: 0x15, cycles: 4 }, { name: "ASL", addrMode: "ZPX", opcode: 0x16, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x17, cycles: 6 }, { name: "CLC", addrMode: "IMP", opcode: 0x18, cycles: 2 }, { name: "ORA", addrMode: "ABY", opcode: 0x19, cycles: 4 }, { name: "???", addrMode: "IMP", opcode: 0x1A, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x1B, cycles: 7 }, { name: "???", addrMode: "IMP", opcode: 0x1C, cycles: 4 }, { name: "ORA", addrMode: "ABX", opcode: 0x1D, cycles: 4 }, { name: "ASL", addrMode: "ABX", opcode: 0x1E, cycles: 7 }, { name: "???", addrMode: "IMP", opcode: 0x1F, cycles: 7 }, 
      { name: "JSR", addrMode: "ABS", opcode: 0x20, cycles: 6 }, { name: "AND", addrMode: "IZX", opcode: 0x21, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x22, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x23, cycles: 8 }, { name: "BIT", addrMode: "ZP0", opcode: 0x24, cycles: 3 }, { name: "AND", addrMode: "ZP0", opcode: 0x25, cycles: 3 }, { name: "ROL", addrMode: "ZP0", opcode: 0x26, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0x27, cycles: 5 }, { name: "PLP", addrMode: "IMP", opcode: 0x28, cycles: 4 }, { name: "AND", addrMode: "IMM", opcode: 0x29, cycles: 2 }, { name: "ROL", addrMode: "IMP", opcode: 0x2A, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x2B, cycles: 2 }, { name: "BIT", addrMode: "ABS", opcode: 0x2C, cycles: 4 }, { name: "AND", addrMode: "ABS", opcode: 0x2D, cycles: 4 }, { name: "ROL", addrMode: "ABS", opcode: 0x2E, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x2F, cycles: 6 },
      { name: "BMI", addrMode: "REL", opcode: 0x30, cycles: 2 }, { name: "AND", addrMode: "IZY", opcode: 0x31, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0x32, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x33, cycles: 8 }, { name: "???", addrMode: "IMP", opcode: 0x34, cycles: 4 }, { name: "AND", addrMode: "ZPX", opcode: 0x35, cycles: 4 }, { name: "ROL", addrMode: "ZPX", opcode: 0x36, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x37, cycles: 6 }, { name: "SEC", addrMode: "IMP", opcode: 0x38, cycles: 2 }, { name: "AND", addrMode: "ABY", opcode: 0x39, cycles: 4 }, { name: "???", addrMode: "IMP", opcode: 0x3A, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x3B, cycles: 7 }, { name: "???", addrMode: "IMP", opcode: 0x3C, cycles: 4 }, { name: "AND", addrMode: "ABX", opcode: 0x3D, cycles: 4 }, { name: "ROL", addrMode: "ABX", opcode: 0x3E, cycles: 7 }, { name: "???", addrMode: "IMP", opcode: 0x3F, cycles: 7 },
      { name: "RTI", addrMode: "IMP", opcode: 0x40, cycles: 6 }, { name: "EOR", addrMode: "IZX", opcode: 0x41, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x42, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x43, cycles: 8 }, { name: "???", addrMode: "IMP", opcode: 0x44, cycles: 3 }, { name: "EOR", addrMode: "ZP0", opcode: 0x45, cycles: 3 }, { name: "LSR", addrMode: "ZP0", opcode: 0x46, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0x47, cycles: 5 }, { name: "PHA", addrMode: "IMP", opcode: 0x48, cycles: 3 }, { name: "EOR", addrMode: "IMM", opcode: 0x49, cycles: 2 }, { name: "LSR", addrMode: "IMP", opcode: 0x4A, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x4B, cycles: 2 }, { name: "JMP", addrMode: "ABS", opcode: 0x4C, cycles: 3 }, { name: "EOR", addrMode: "ABS", opcode: 0x4D, cycles: 4 }, { name: "LSR", addrMode: "ABS", opcode: 0x4E, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x4F, cycles: 6 },
      { name: "BVC", addrMode: "REL", opcode: 0x50, cycles: 2 }, { name: "EOR", addrMode: "IZY", opcode: 0x51, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0x52, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x53, cycles: 8 }, { name: "???", addrMode: "IMP", opcode: 0x54, cycles: 4 }, { name: "EOR", addrMode: "ZPX", opcode: 0x55, cycles: 4 }, { name: "LSR", addrMode: "ZPX", opcode: 0x56, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x57, cycles: 6 }, { name: "CLI", addrMode: "IMP", opcode: 0x58, cycles: 2 }, { name: "EOR", addrMode: "ABY", opcode: 0x59, cycles: 4 }, { name: "???", addrMode: "IMP", opcode: 0x5A, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x5B, cycles: 7 }, { name: "???", addrMode: "IMP", opcode: 0x5C, cycles: 4 }, { name: "EOR", addrMode: "ABX", opcode: 0x5D, cycles: 4 }, { name: "LSR", addrMode: "ABX", opcode: 0x5E, cycles: 7 }, { name: "???", addrMode: "IMP", opcode: 0x5F, cycles: 7 },
      { name: "RTS", addrMode: "IMP", opcode: 0x60, cycles: 6 }, { name: "ADC", addrMode: "IZX", opcode: 0x61, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x62, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x63, cycles: 8 }, { name: "???", addrMode: "IMP", opcode: 0x64, cycles: 3 }, { name: "ADC", addrMode: "ZP0", opcode: 0x65, cycles: 3 }, { name: "ROR", addrMode: "ZP0", opcode: 0x66, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0x67, cycles: 5 }, { name: "PLA", addrMode: "IMP", opcode: 0x68, cycles: 4 }, { name: "ADC", addrMode: "IMM", opcode: 0x69, cycles: 2 }, { name: "ROR", addrMode: "IMP", opcode: 0x6A, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x6B, cycles: 2 }, { name: "JMP", addrMode: "IND", opcode: 0x6C, cycles: 5 }, { name: "ADC", addrMode: "ABS", opcode: 0x6D, cycles: 4 }, { name: "ROR", addrMode: "ABS", opcode: 0x6E, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x6F, cycles: 6 },
      { name: "BVS", addrMode: "REL", opcode: 0x70, cycles: 2 }, { name: "ADC", addrMode: "IZY", opcode: 0x71, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0x72, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x73, cycles: 8 }, { name: "???", addrMode: "IMP", opcode: 0x74, cycles: 4 }, { name: "ADC", addrMode: "ZPX", opcode: 0x75, cycles: 4 }, { name: "ROR", addrMode: "ZPX", opcode: 0x76, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x77, cycles: 6 }, { name: "SEI", addrMode: "IMP", opcode: 0x78, cycles: 2 }, { name: "ADC", addrMode: "ABY", opcode: 0x79, cycles: 4 }, { name: "???", addrMode: "IMP", opcode: 0x7A, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x7B, cycles: 7 }, { name: "???", addrMode: "IMP", opcode: 0x7C, cycles: 4 }, { name: "ADC", addrMode: "ABX", opcode: 0x7D, cycles: 4 }, { name: "ROR", addrMode: "ABX", opcode: 0x7E, cycles: 7 }, { name: "???", addrMode: "IMP", opcode: 0x7F, cycles: 7 },
      { name: "???", addrMode: "IMP", opcode: 0x80, cycles: 2 }, { name: "STA", addrMode: "IZX", opcode: 0x81, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x82, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x83, cycles: 6 }, { name: "STY", addrMode: "ZP0", opcode: 0x84, cycles: 3 }, { name: "STA", addrMode: "ZP0", opcode: 0x85, cycles: 3 }, { name: "STX", addrMode: "ZP0", opcode: 0x86, cycles: 3 }, { name: "???", addrMode: "IMP", opcode: 0x87, cycles: 3 }, { name: "DEY", addrMode: "IMP", opcode: 0x88, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x89, cycles: 2 }, { name: "TXA", addrMode: "IMP", opcode: 0x8A, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x8B, cycles: 2 }, { name: "STY", addrMode: "ABS", opcode: 0x8C, cycles: 4 }, { name: "STA", addrMode: "ABS", opcode: 0x8D, cycles: 4 }, { name: "STX", addrMode: "ABS", opcode: 0x8E, cycles: 4 }, { name: "???", addrMode: "IMP", opcode: 0x8F, cycles: 4 },
      { name: "BCC", addrMode: "REL", opcode: 0x90, cycles: 2 }, { name: "STA", addrMode: "IZY", opcode: 0x91, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0x92, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x93, cycles: 6 }, { name: "STY", addrMode: "ZPX", opcode: 0x94, cycles: 4 }, { name: "STA", addrMode: "ZPX", opcode: 0x95, cycles: 4 }, { name: "STX", addrMode: "ZPY", opcode: 0x96, cycles: 4 }, { name: "???", addrMode: "IMP", opcode: 0x97, cycles: 4 }, { name: "TYA", addrMode: "IMP", opcode: 0x98, cycles: 2 }, { name: "STA", addrMode: "ABY", opcode: 0x99, cycles: 5 }, { name: "TXS", addrMode: "IMP", opcode: 0x9A, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0x9B, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0x9C, cycles: 5 }, { name: "STA", addrMode: "ABX", opcode: 0x9D, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0x9E, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0x9F, cycles: 5 },
      { name: "LDY", addrMode: "IMM", opcode: 0xA0, cycles: 2 }, { name: "LDA", addrMode: "IZX", opcode: 0xA1, cycles: 6 }, { name: "LDX", addrMode: "IMM", opcode: 0xA2, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0xA3, cycles: 6 }, { name: "LDY", addrMode: "ZP0", opcode: 0xA4, cycles: 3 }, { name: "LDA", addrMode: "ZP0", opcode: 0xA5, cycles: 3 }, { name: "LDX", addrMode: "ZP0", opcode: 0xA6, cycles: 3 }, { name: "???", addrMode: "IMP", opcode: 0xA7, cycles: 3 }, { name: "TAY", addrMode: "IMP", opcode: 0xA8, cycles: 2 }, { name: "LDA", addrMode: "IMM", opcode: 0xA9, cycles: 2 }, { name: "TAX", addrMode: "IMP", opcode: 0xAA, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0xAB, cycles: 2 }, { name: "LDY", addrMode: "ABS", opcode: 0xAC, cycles: 4 }, { name: "LDA", addrMode: "ABS", opcode: 0xAD, cycles: 4 }, { name: "LDX", addrMode: "ABS", opcode: 0xAE, cycles: 4 }, { name: "???", addrMode: "IMP", opcode: 0xAF, cycles: 4 },
      { name: "BCS", addrMode: "REL", opcode: 0xB0, cycles: 2 }, { name: "LDA", addrMode: "IZY", opcode: 0xB1, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0xB2, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0xB3, cycles: 5 }, { name: "LDY", addrMode: "ZPX", opcode: 0xB4, cycles: 4 }, { name: "LDA", addrMode: "ZPX", opcode: 0xB5, cycles: 4 }, { name: "LDX", addrMode: "ZPY", opcode: 0xB6, cycles: 4 }, { name: "???", addrMode: "IMP", opcode: 0xB7, cycles: 4 }, { name: "CLV", addrMode: "IMP", opcode: 0xB8, cycles: 2 }, { name: "LDA", addrMode: "ABY", opcode: 0xB9, cycles: 4 }, { name: "TSX", addrMode: "IMP", opcode: 0xBA, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0xBB, cycles: 4 }, { name: "LDY", addrMode: "ABX", opcode: 0xBC, cycles: 4 }, { name: "LDA", addrMode: "ABX", opcode: 0xBD, cycles: 4 }, { name: "LDX", addrMode: "ABY", opcode: 0xBE, cycles: 4 }, { name: "???", addrMode: "IMP", opcode: 0xBF, cycles: 4 },
      { name: "CPY", addrMode: "IMM", opcode: 0xC0, cycles: 2 }, { name: "CMP", addrMode: "IZX", opcode: 0xC1, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0xC2, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0xC3, cycles: 8 }, { name: "CPY", addrMode: "ZP0", opcode: 0xC4, cycles: 3 }, { name: "CMP", addrMode: "ZP0", opcode: 0xC5, cycles: 3 }, { name: "DEC", addrMode: "ZP0", opcode: 0xC6, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0xC7, cycles: 5 }, { name: "INY", addrMode: "IMP", opcode: 0xC8, cycles: 2 }, { name: "CMP", addrMode: "IMM", opcode: 0xC9, cycles: 2 }, { name: "DEX", addrMode: "IMP", opcode: 0xCA, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0xCB, cycles: 2 }, { name: "CPY", addrMode: "ABS", opcode: 0xCC, cycles: 4 }, { name: "CMP", addrMode: "ABS", opcode: 0xCD, cycles: 4 }, { name: "DEC", addrMode: "ABS", opcode: 0xCE, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0xCF, cycles: 6 },
      { name: "BNE", addrMode: "REL", opcode: 0xD0, cycles: 2 }, { name: "CMP", addrMode: "IZY", opcode: 0xD1, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0xD2, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0xD3, cycles: 8 }, { name: "???", addrMode: "IMP", opcode: 0xD4, cycles: 4 }, { name: "CMP", addrMode: "ZPX", opcode: 0xD5, cycles: 4 }, { name: "DEC", addrMode: "ZPX", opcode: 0xD6, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0xD7, cycles: 6 }, { name: "CLD", addrMode: "IMP", opcode: 0xD8, cycles: 2 }, { name: "CMP", addrMode: "ABY", opcode: 0xD9, cycles: 4 }, { name: "???", addrMode: "IMP", opcode: 0xDA, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0xDB, cycles: 7 }, { name: "???", addrMode: "IMP", opcode: 0xDC, cycles: 4 }, { name: "CMP", addrMode: "ABX", opcode: 0xDD, cycles: 4 }, { name: "DEC", addrMode: "ABX", opcode: 0xDE, cycles: 7 }, { name: "???", addrMode: "IMP", opcode: 0xDF, cycles: 7 },
      { name: "CPX", addrMode: "IMM", opcode: 0xE0, cycles: 2 }, { name: "SBC", addrMode: "IZX", opcode: 0xE1, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0xE2, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0xE3, cycles: 8 }, { name: "CPX", addrMode: "ZP0", opcode: 0xE4, cycles: 3 }, { name: "SBC", addrMode: "ZP0", opcode: 0xE5, cycles: 3 }, { name: "INC", addrMode: "ZP0", opcode: 0xE6, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0xE7, cycles: 5 }, { name: "INX", addrMode: "IMP", opcode: 0xE8, cycles: 2 }, { name: "SBC", addrMode: "IMM", opcode: 0xE9, cycles: 2 }, { name: "NOP", addrMode: "IMP", opcode: 0xEA, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0xEB, cycles: 2 }, { name: "CPX", addrMode: "ABS", opcode: 0xEC, cycles: 4 }, { name: "SBC", addrMode: "ABS", opcode: 0xED, cycles: 4 }, { name: "INC", addrMode: "ABS", opcode: 0xEE, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0xEF, cycles: 6 },
      { name: "BEQ", addrMode: "REL", opcode: 0xF0, cycles: 2 }, { name: "SBC", addrMode: "IZY", opcode: 0xF1, cycles: 5 }, { name: "???", addrMode: "IMP", opcode: 0xF2, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0xF3, cycles: 8 }, { name: "???", addrMode: "IMP", opcode: 0xF4, cycles: 4 }, { name: "SBC", addrMode: "ZPX", opcode: 0xF5, cycles: 4 }, { name: "INC", addrMode: "ZPX", opcode: 0xF6, cycles: 6 }, { name: "???", addrMode: "IMP", opcode: 0xF7, cycles: 6 }, { name: "SED", addrMode: "IMP", opcode: 0xF8, cycles: 2 }, { name: "SBC", addrMode: "ABY", opcode: 0xF9, cycles: 4 }, { name: "NOP", addrMode: "IMP", opcode: 0xFA, cycles: 2 }, { name: "???", addrMode: "IMP", opcode: 0xFB, cycles: 7 }, { name: "???", addrMode: "IMP", opcode: 0xFC, cycles: 4 }, { name: "SBC", addrMode: "ABX", opcode: 0xFD, cycles: 4 }, { name: "INC", addrMode: "ABX", opcode: 0xFE, cycles: 7 }, { name: "???", addrMode: "IMP", opcode: 0xFF, cycles: 7 }
    ];

    this.FLAGS6502 = {
      C: 0b00000001,  // Carry Bit
      Z: 0b00000010,  // Zero
      I: 0b00000100,  // Disable Interrupts
      D: 0b00001000,  // Decimal Mode (unused in this implementation)
      B: 0b00010000,  // Break
      U: 0b00100000,  // Unused
      V: 0b01000000,  // Overflow
      N: 0b10000000   // Negative
    };

    // 6502 CPU Registers
    this._a      = 0b00000000;  // Accumulator Register
    this._x      = 0b00000000;  // X Register
    this._y      = 0b00000000;  // Y Register
    
    this._status = 0b00000000;  // Status Register
    this._stkp   = 0b00000000;  // Stack Pointer
    this._pc     = 0b0000000000000000;  // Program Counter
  }

  /**
   * @param {Bus} bus 
   */
  connectBus(bus) {
    this.bus = bus;
  }

  fetch() {}

  // Addressing Modes
  IMP() {}; IMM() {}; ZP0() {}; ZPX() {};
  ZPY() {}; REL() {}; ABS() {}; ABX() {};
  ABY() {}; IND() {}; IZX() {}; IZY() {};

  // Opcodes
  ADC() {}; AND() {}; ASL() {}; BCC() {};
  BCS() {}; BEQ() {}; BIT() {}; BMI() {};
  BNE() {}; BPL() {}; BRK() {}; BVC() {};
  BVS() {}; CLC() {}; CLD() {}; CLI() {};
  CLV() {}; CMP() {}; CPX() {}; CPY() {};
  DEC() {}; DEX() {}; DEY() {}; EOR() {};
  INC() {}; INX() {}; INY() {}; JMP() {};
  JSR() {}; LDA() {}; LDX() {}; LDY() {};
  LSR() {}; NOP() {}; ORA() {}; PHA() {};
  PHP() {}; PLA() {}; PLP() {}; ROL() {};
  ROR() {}; RTI() {}; RTS() {}; SBC() {};
  SEC() {}; SED() {}; SEI() {}; STA() {};
  STX() {}; STY() {}; TAX() {}; TAY() {};
  TSX() {}; TXA() {}; TXS() {}; TYA() {};

  XXX() {}

  // Signals
  clock() {}
  reset() {}
  irq() {}
  nmi() {}

  // Private
  /**
   * Get flag status.
   * 
   * @param {number} flag
   * @returns {number}
   */
  _getFlag(flag) {
    return (this._status & flag) > 0 ? 1 : 0;
  }

  /**
   * Set flag status.
   * 
   * @param {number} flag
   * @param {boolean} value
   * @returns {void}
   */
  _setFlag(flag, value) {
    if (value) {
      this._status |= flag;
    } else {
      this._status &= ~flag;
    }
  }

  /**
   * Thin wrapper around read from bus.
   * 
   * @param {number} address 
   */
  _read(address) {
    return this.bus.read(address);
  }

  /**
   * Thin wrapper around write to bus.
   * 
   * @param {number} address 
   * @param {number} data 
   */
  _write(address, data) {
    this.bus.write(address, data);
  }
}

class Bus {
  constructor() {
    // 64KB of RAM
    this.ram = new Array(64 * 1024).fill(0);

    // CPU
    this.cpu = new Olc6502();
    this.cpu.connectBus(this);
  }

  /**
   * Reads from memory.
   *
   * @param {number} address 16 bit unsigned integer.
   * @param {boolean} bReadOnly ??
   * @returns {number} 8 bit unsigned integer.
   */
  read(address, bReadOnly = false) {
    if (address >= 0x0000 && address <= 0xFFFF) {
      return this.ram[address];
    }

    return 0x00;
  }

  /**
   * Writes to memory.
   * 
   * @param {number} address - 16 bit unsigned integer.
   * @param {number} data - 8 bit unsigned integer.
   * @returns {void}
   */
  write(address, data) {
    if (address >= 0x0000 && address <= 0xFFFF) {
      this.ram[address] = data;
    }
  }
}

class Instruction {
  constructor() {
    /**
     * The name of the instruction.
     * @type {string}
     */
    this.name = '';

    /**
     * The addressing mode of the instruction.
     * @type {string}
     */
    this.addrMode = '';

    /**
     * The opcode of the instruction.
     * @type {number}
     */
    this.opcode = 0x00;

    /**
     * The number of cycles the instruction takes to execute.
     * @type {number}
     */
    this.cycles = 0;
  }
}
