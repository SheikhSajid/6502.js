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
    this._opcode = 0b00000000;  // Represents the current opcode
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

  fetch() {
    if (this.lookup[this._opcode].addrMode === "IMP") {
      return this.fetched;
    }

    this.fetched = this._read(this.addrAbs);
    return this.fetched;
  }

  // Addressing Modes
  IMP() {
    this.fetched = this._a;
    return 0;
  }
  
  IMM() {
    this.addrAbs = this._pc++;
    return 0;
  };
  
  ZP0() {
    this.addrAbs = this._read(this._pc);
    this._pc++;
    this.addrAbs &= 0x00FF;
    return 0;
  }
  
  ZPX() {
    this.addrAbs = (this._read(this._pc) + this._x);
    this._pc++;
    this.addrAbs &= 0x00FF;
    return 0;
  }
  
  ZPY() {
    this.addrAbs = (this._read(this._pc) + this._y);
    this._pc++;
    this.addrAbs &= 0x00FF;
    return 0;
  }
  
  REL() {
    this.addrRel = this._read(this._pc);
    this._pc++;
    if (this.addrRel & 0x80) {
      this.addrRel |= 0xFF00;
    }
    return 0;
  }
  
  // Absolute: 16 bit address (total 3 byte instruction)
  ABS() {
    const lo = this._read(this._pc);
    this._pc++;
    const hi = this._read(this._pc);
    this._pc++;

    this.addrAbs = (hi << 8) | lo;
    return 0;
  }
  
  ABX() {
    const lo = this._read(this._pc);
    this._pc++;
    const hi = this._read(this._pc);
    this._pc++;

    this.addrAbs = (hi << 8) | lo;
    this.addrAbs += this._x;

    if ((this.addrAbs & 0xFF00) !== (hi << 8)) {
      return 1;
    }

    return 0;
  }
  
  ABY() {
    const lo = this._read(this._pc);
    this._pc++;
    const hi = this._read(this._pc);
    this._pc++;

    this.addrAbs = (hi << 8) | lo;
    this.addrAbs += this._y;

    if ((this.addrAbs & 0xFF00) !== (hi << 8)) {
      return 1;
    }

    return 0;
  }
  
  IND() {
    const ptrLo = this._read(this._pc);
    this._pc++;
    const ptrHi = this._read(this._pc);
    this._pc++;

    const ptr = (ptrHi << 8) | ptrLo;

    if (ptrLo === 0x00FF) { // Simulate page boundary hardware bug
      this.addrAbs = (this._read(ptr & 0xFF00) << 8) | this._read(ptr + 0);
    } else { // Behave normally
      this.addrAbs = (this._read(ptr + 1) << 8) | this._read(ptr + 0);
    }

    return 0;
  }
  
  IZX() {
    const t = this._read(this._pc);
    this._pc++;

    const lo = this._read((t + this._x) & 0x00FF);
    const hi = this._read((t + this._x + 1) & 0x00FF);

    this.addrAbs = (hi << 8) | lo;
    return 0;
  }
  
  IZY() {
    const t = this._read(this._pc);
    this._pc++;

    const lo = this._read(t & 0x00FF);
    const hi = this._read((t + 1) & 0x00FF);

    this.addrAbs = (hi << 8) | lo;
    this.addrAbs += this._y;

    if ((this.addrAbs & 0xFF00) !== (hi << 8)) {
      return 1;
    }

    return 0;
  }

  // Opcodes
  ADC() {
    this.fetch();
    const temp = this._a + this.fetched + this._getFlag(this.FLAGS6502.C);
    this._setFlag(this.FLAGS6502.C, temp > 255);
    this._setFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0);
    this._setFlag(this.FLAGS6502.N, temp & 0x80);
    this._setFlag(this.FLAGS6502.V, (~(this._a ^ this.fetched) & (this._a ^ temp)) & 0x80);
    this._a = temp & 0x00FF;
    return 1;
  }
  
  AND() {
    this.fetch();
    this._a = this._a & this.fetched;
    this._setFlag(this.FLAGS6502.Z, this._a === 0);

    const shouldSetNegative = this._a & 0b10000000; // checks if MSB of register `a` is set
    this._setFlag(this.FLAGS6502.N, shouldSetNegative); // set negative flag
    return 1;
  }
  
  ASL() {
    this.fetch();
    const temp = this.fetched << 1;
    this._setFlag(this.FLAGS6502.C, temp & 0xFF00);
    this._setFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
    this._setFlag(this.FLAGS6502.N, temp & 0x80);

    if (this.lookup[this._opcode].addrMode === "IMP") {
      this._a = temp & 0x00FF;
    } else {
      this._write(this.addrAbs, temp & 0x00FF);
    }

    return 0;
  }
  
  BCC() {
    if (this._getFlag(this.FLAGS6502.C) === 0) {
      this.cycles++;

      this.addrAbs = this._pc + this.addrRel;
      const pageBoundaryCrossed = (this._pc & 0xFF00) !== (this.addrAbs & 0xFF00);
      if (pageBoundaryCrossed) {
        this.cycles++;
      }

      this._pc = this.addrAbs;
    }

    return 0;
  };
  
  BCS() {
    if (this._getFlag(this.FLAGS6502.C) === 1) {
      this.cycles++;

      this.addrAbs = this._pc + this.addrRel;
      const pageBoundaryCrossed = (this._pc & 0xFF00) !== (this.addrAbs & 0xFF00);
      if (pageBoundaryCrossed) {
        this.cycles++;
      }

      this._pc = this.addrAbs;
    }

    return 0;
  }
  
  BEQ() {
    if (this._getFlag(this.FLAGS6502.Z) === 1) {
      this.cycles++;

      this.addrAbs = this._pc + this.addrRel;
      const pageBoundaryCrossed = (this._pc & 0xFF00) !== (this.addrAbs & 0xFF00);
      if (pageBoundaryCrossed) {
        this.cycles++;
      }

      this._pc = this.addrAbs;
    }

    return 0;
  }
  
  BIT() {
    this.fetch();
    const temp = this._a & this.fetched;
    this._setFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
    this._setFlag(this.FLAGS6502.N, this.fetched & (1 << 7));
    this._setFlag(this.FLAGS6502.V, this.fetched & (1 << 6));
    return 0;
  }
  
  BMI() {
    if (this._getFlag(this.FLAGS6502.N) === 1) {
      this.cycles++;

      this.addrAbs = this._pc + this.addrRel;
      const pageBoundaryCrossed = (this._pc & 0xFF00) !== (this.addrAbs & 0xFF00);
      if (pageBoundaryCrossed) {
        this.cycles++;
      }

      this._pc = this.addrAbs;
    }

    return 0;
  }
  
  BNE() {
    if (this._getFlag(this.FLAGS6502.Z) === 0) {
      this.cycles++;

      this.addrAbs = this._pc + this.addrRel;
      const pageBoundaryCrossed = (this._pc & 0xFF00) !== (this.addrAbs & 0xFF00);
      if (pageBoundaryCrossed) {
        this.cycles++;
      }

      this._pc = this.addrAbs;
    }

    return 0;
  }
  
  BPL() {
    if (this._getFlag(this.FLAGS6502.N) === 0) {
      this.cycles++;

      this.addrAbs = this._pc + this.addrRel;
      const pageBoundaryCrossed = (this._pc & 0xFF00) !== (this.addrAbs & 0xFF00);
      if (pageBoundaryCrossed) {
        this.cycles++;
      }

      this._pc = this.addrAbs;
    }

    return 0;
  }
  
  BRK() {
    this._pc++;
    this._setFlag(this.FLAGS6502.I, true);
    this._write(0x0100 + this._stkp, (this._pc >> 8) & 0x00FF);
    this._stkp--;
    this._write(0x0100 + this._stkp, this._pc & 0x00FF);
    this._stkp--;

    this._setFlag(this.FLAGS6502.B, true);
    this._write(0x0100 + this._stkp, this._status);
    this._stkp--;
    this._setFlag(this.FLAGS6502.B, false);

    this._pc = this._read(0xFFFE) | (this._read(0xFFFF) << 8);
    return 0;
  }
  
  BVC() {
    if (this._getFlag(this.FLAGS6502.V) === 0) {
      this.cycles++;

      this.addrAbs = this._pc + this.addrRel;
      const pageBoundaryCrossed = (this._pc & 0xFF00) !== (this.addrAbs & 0xFF00);
      if (pageBoundaryCrossed) {
        this.cycles++;
      }

      this._pc = this.addrAbs;
    }

    return 0;
  }
  
  BVS() {
    if (this._getFlag(this.FLAGS6502.V) === 1) {
      this.cycles++;

      this.addrAbs = this._pc + this.addrRel;
      const pageBoundaryCrossed = (this._pc & 0xFF00) !== (this.addrAbs & 0xFF00);
      if (pageBoundaryCrossed) {
        this.cycles++;
      }

      this._pc = this.addrAbs;
    }

    return 0;
  }
  
  CLC() {
    this._setFlag(this.FLAGS6502.C, false);
    return 0;
  }
  
  CLD() {
    this._setFlag(this.FLAGS6502.D, false);
    return 0;
  }
  
  CLI() {
    this._setFlag(this.FLAGS6502.I, false);
    return 0;
  }
  
  CLV() {
    this._setFlag(this.FLAGS6502.V, false);
    return 0;
  }
  
  CMP() {
    this.fetch();
    const temp = this._a - this.fetched;
    this._setFlag(this.FLAGS6502.C, this._a >= this.fetched);
    this._setFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
    this._setFlag(this.FLAGS6502.N, temp & 0x80);
    return 1;
  }
  
  CPX() {
    this.fetch();
    const temp = this._x - this.fetched;
    this._setFlag(this.FLAGS6502.C, this._x >= this.fetched);
    this._setFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
    this._setFlag(this.FLAGS6502.N, temp & 0x80);
    return 0;
  }
  
  CPY() {
    this.fetch();
    const temp = this._y - this.fetched;
    this._setFlag(this.FLAGS6502.C, this._y >= this.fetched);
    this._setFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
    this._setFlag(this.FLAGS6502.N, temp & 0x80);
    return 0;
  }


  DEC() {
    this.fetch();
    const temp = this.fetched - 1;
    this._write(this.addrAbs, temp & 0x00FF);
    this._setFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
    this._setFlag(this.FLAGS6502.N, temp & 0x80);
    return 0;
  }
  
  DEX() {
    this._x--;
    this._setFlag(this.FLAGS6502.Z, this._x === 0x00);
    this._setFlag(this.FLAGS6502.N, this._x & 0x80);
    return 0;
  }
  
  DEY() {
    this._y--;
    this._setFlag(this.FLAGS6502.Z, this._y === 0x00);
    this._setFlag(this.FLAGS6502.N, this._y & 0x80);
    return 0;
  }
  
  EOR() {
    this.fetch();
    this._a = this._a ^ this.fetched;
    this._setFlag(this.FLAGS6502.Z, this._a === 0x00);
    this._setFlag(this.FLAGS6502.N, this._a & 0x80);
    return 1;
  }

  INC() {
    this.fetch();
    const temp = this.fetched + 1;
    this._write(this.addrAbs, temp & 0x00FF);
    this._setFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
    this._setFlag(this.FLAGS6502.N, temp & 0x80);
    return 0;
  }
  
  INX() {
    this._x++;
    this._setFlag(this.FLAGS6502.Z, this._x === 0x00);
    this._setFlag(this.FLAGS6502.N, this._x & 0x80);
    return 0;
  }
  
  INY() {
    this._y++;
    this._setFlag(this.FLAGS6502.Z, this._y === 0x00);
    this._setFlag(this.FLAGS6502.N, this._y & 0x80);
    return 0;
  }
  
  JMP() {
    this._pc = this.addrAbs;
    return 0;
  }
  
  JSR() {
    this._pc--;

    this._write(0x0100 + this._stkp, (this._pc >> 8) & 0x00FF);
    this._stkp--;
    this._write(0x0100 + this._stkp, this._pc & 0x00FF);
    this._stkp--;

    this._pc = this.addrAbs;
    return 0;
  }
  
  LDA() {
    this.fetch();
    this._a = this.fetched;
    this._setFlag(this.FLAGS6502.Z, this._a === 0x00);
    this._setFlag(this.FLAGS6502.N, this._a & 0x80);
    return 1;
  }
  
  LDX() {
    this.fetch();
    this._x = this.fetched;
    this._setFlag(this.FLAGS6502.Z, this._x === 0x00);
    this._setFlag(this.FLAGS6502.N, this._x & 0x80);
    return 1;
  }
  
  LDY() {
    this.fetch();
    this._y = this.fetched;
    this._setFlag(this.FLAGS6502.Z, this._y === 0x00);
    this._setFlag(this.FLAGS6502.N, this._y & 0x80);
    return 1;
  }

  LSR() {
    this.fetch();
    const temp = this.fetched >> 1;
    this._setFlag(this.FLAGS6502.C, this.fetched & 0x0001);
    this._setFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
    this._setFlag(this.FLAGS6502.N, temp & 0x80);
    if (this.lookup[this._opcode].addrMode === "IMP") {
      this._a = temp & 0x00FF;
    } else {
      this._write(this.addrAbs, temp & 0x00FF);
    }
    return 0;
  }

  NOP() {
    if (this._opcode === 0xEA) {
      return 0;
    }

    return 1;
  }

  ORA() {
    this.fetch();
    this._a = this._a | this.fetched;
    this._setFlag(this.FLAGS6502.Z, this._a === 0x00);
    this._setFlag(this.FLAGS6502.N, this._a & 0x80);
    return 1;
  }

  PHA() {
    this._write(0x0100 + this._stkp, this._a);
    this._stkp--;
    return 0;
  }

  PHP() {
    this._write(0x0100 + this._stkp, this._status | this.FLAGS6502.B | this.FLAGS6502.U);
    this._setFlag(this.FLAGS6502.B, false);
    this._setFlag(this.FLAGS6502.U, false);
    this._stkp--;
    return 0;
  }

  PLA() {
    this._stkp++;
    this._a = this._read(0x0100 + this._stkp);
    this._setFlag(this.FLAGS6502.Z, this._a === 0x00);
    this._setFlag(this.FLAGS6502.N, this._a & 0x80);
    return 0;
  }

  PLP() {
    this._stkp++;
    this._status = this._read(0x0100 + this._stkp);
    this._setFlag(this.FLAGS6502.U, true);
    return 0;
  }

  ROL() {
    this.fetch();
    const temp = (this.fetched << 1) | this._getFlag(this.FLAGS6502.C);
    this._setFlag(this.FLAGS6502.C, temp & 0xFF00);
    this._setFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
    this._setFlag(this.FLAGS6502.N, temp & 0x80);
    if (this.lookup[this._opcode].addrMode === "IMP") {
      this._a = temp & 0x00FF;
    } else {
      this._write(this.addrAbs, temp & 0x00FF);
    }
    return 0;
  }

  ROR() {
    this.fetch();
    const temp = (this._getFlag(this.FLAGS6502.C) << 7) | (this.fetched >> 1);
    this._setFlag(this.FLAGS6502.C, this.fetched & 0x01);
    this._setFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
    this._setFlag(this.FLAGS6502.N, temp & 0x80);
    if (this.lookup[this._opcode].addrMode === "IMP") {
      this._a = temp & 0x00FF;
    } else {
      this._write(this.addrAbs, temp & 0x00FF);
    }
    return 0;
  }

  RTI() {
    this._stkp++;
    this._status = this._read(0x0100 + this._stkp);
    this._status &= ~this.FLAGS6502.B;
    this._status &= ~this.FLAGS6502.U;

    this._stkp++;
    this._pc = this._read(0x0100 + this._stkp);
    this._stkp++;
    this._pc |= this._read(0x0100 + this._stkp) << 8;
    return 0;
  }

  RTS() {
    this._stkp++;
    this._pc = this._read(0x0100 + this._stkp);
    this._stkp++;
    this._pc |= this._read(0x0100 + this._stkp) << 8;

    this._pc++;
    return 0;
  }

  SBC() {
    this.fetch();
    const value = this.fetched ^ 0x00FF;
    const temp = this._a + value + this._getFlag(this.FLAGS6502.C);
    this._setFlag(this.FLAGS6502.C, temp & 0xFF00);
    this._setFlag(this.FLAGS6502.Z, (temp & 0x00FF) === 0x00);
    this._setFlag(this.FLAGS6502.V, (temp ^ this._a) & (temp ^ value) & 0x0080);
    this._setFlag(this.FLAGS6502.N, temp & 0x80);
    this._a = temp & 0x00FF;
    return 1;
  }

  SEC() {
    this._setFlag(this.FLAGS6502.C, true);
    return 0;
  }

  SED() {
    this._setFlag(this.FLAGS6502.D, true);
    return 0;
  }

  SEI() {
    this._setFlag(this.FLAGS6502.I, true);
    return 0;
  }

  STA() {
    this._write(this.addrAbs, this._a);
    return 0;
  }

  STX() {
    this._write(this.addrAbs, this._x);
    return 0;
  }

  STY() {
    this._write(this.addrAbs, this._y);
    return 0;
  }

  TAX() {
    this._x = this._a;
    this._setFlag(this.FLAGS6502.Z, this._x === 0x00);
    this._setFlag(this.FLAGS6502.N, this._x & 0x80);
    return 0;
  }

  TAY() {
    this._y = this._a;
    this._setFlag(this.FLAGS6502.Z, this._y === 0x00);
    this._setFlag(this.FLAGS6502.N, this._y & 0x80);
    return 0;
  }

  TSX() {
    this._x = this._stkp;
    this._setFlag(this.FLAGS6502.Z, this._x === 0x00);
    this._setFlag(this.FLAGS6502.N, this._x & 0x80);
    return 0;
  }

  TXA() {
    this._a = this._x;
    this._setFlag(this.FLAGS6502.Z, this._a === 0x00);
    this._setFlag(this.FLAGS6502.N, this._a & 0x80);
    return 0;
  }

  TXS() {
    this._stkp = this._x;
    return 0;
  }

  TYA() {
    this._a = this._y;
    this._setFlag(this.FLAGS6502.Z, this._a === 0x00);
    this._setFlag(this.FLAGS6502.N, this._a & 0x80);
    return 0;
  }

  XXX() {
    return 0;
  }

  // Signals
  clock() {
    if (this.cycles !== 0) {
      this.cycles--;
      return;
    }

    // Read from the program counter
    this._opcode = this._read(this._pc); // 1 byte
    this._pc++;

    // Lookup the opcode and execute the instruction
    const { addrMode, cycles, name } = this.lookup[this._opcode];
    this.cycles = cycles;
    const additionalCycles1 = this[addrMode]();
    const additionalCycles2 = this[name === '???' ? 'XXX' : name]();

    this.cycles += (additionalCycles1 & additionalCycles2);
  }

  reset() {
    this._a = 0;
    this._x = 0;
    this._y = 0;
    this._stkp = 0xFD;
    this._status = 0x00 | this.FLAGS6502.U;

    // Programmer should store the reset instruction at 0xFFFC
    //  ? What does it mean by reset?
    //  ? Is reset an interrupt or similar?
    this.addrAbs = 0xFFFC;
    const lo = this._read(this.addrAbs + 0);
    const hi = this._read(this.addrAbs + 1);

    this._pc = (hi << 8) | lo;

    this.addrRel = 0x0000;
    this.addrAbs = 0x0000;
    this.fetched = 0x00;

    this.cycles = 8;
  }

  irq() {
    if (this._getFlag(this.FLAGS6502.I) === 0) {
      this._write(0x0100 + this._stkp, (this._pc >> 8) & 0x00FF);
      this._stkp--;
      this._write(0x0100 + this._stkp, this._pc & 0x00FF);
      this._stkp--;

      this._setFlag(this.FLAGS6502.B, false);
      this._setFlag(this.FLAGS6502.U, true);
      this._setFlag(this.FLAGS6502.I, true);
      this._write(0x0100 + this._stkp, this._status);
      this._stkp--;

      // ? is this an interrupt handler?
      this.addrAbs = 0xFFFE;
      const lo = this._read(this.addrAbs + 0);
      const hi = this._read(this.addrAbs + 1);
      this._pc = (hi << 8) | lo;

      this.cycles = 7;
    }
  }

  nmi() {
    this._write(0x0100 + this._stkp, (this._pc >> 8) & 0x00FF);
    this._stkp--;
    this._write(0x0100 + this._stkp, this._pc & 0x00FF);
    this._stkp--;

    this._setFlag(this.FLAGS6502.B, false);
    this._setFlag(this.FLAGS6502.U, true);
    this._setFlag(this.FLAGS6502.I, true);
    this._write(0x0100 + this._stkp, this._status);
    this._stkp--;

    this.addrAbs = 0xFFFA;
    const lo = this._read(this.addrAbs + 0);
    const hi = this._read(this.addrAbs + 1);
    this._pc = (hi << 8) | lo;

    this.cycles = 8;
  }

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

  // This function logs the state of the CPU
  disassemble(start, stop) {
    let addr = start;
    let value = 0x00, lo = 0x00, hi = 0x00;
    let lineAddr = 0;

    while (addr <= stop) {
      lineAddr = addr;

      let sInst = '$' + addr.toString(16).padStart(4, '0') + ': ';
      let opcode = this._read(addr);
      let instruction = this.lookup[opcode];
      addr++;
      sInst += instruction.name + ' ';

      switch (instruction.addrMode) {
        case "IMP":
          sInst += " {IMP}";
          break;
        case "IMM":
          value = this._read(addr);
          addr++;
          sInst += "#$" + value.toString(16).padStart(2, '0') + " {IMM}";
          break;
        case "ZP0":
        case "ZPX":
        case "ZPY":
        case "IZX":
        case "IZY":
          lo = this._read(addr);
          addr++;
          hi = 0x00;
          sInst += "$" + lo.toString(16).padStart(2, '0') + ` {${instruction.addrMode}}`;
          break;
        case "ABS":
        case "ABX":
        case "ABY":
        case "IND":
          lo = this._read(addr);
          addr++;
          hi = this._read(addr);
          addr++;
          sInst += "$" + (hi << 8 | lo).toString(16).padStart(4, '0') + ` {${instruction.addrMode}}`;
          break;
        case "REL":
          value = this._read(addr);
          addr++;
          sInst += "$" + value.toString(16).padStart(2, '0') + ` [$${(addr + value).toString(16).padStart(4, '0')}] {${instruction.addrMode}}`;
          break;
        default:
          // Handle unknown addressing mode if necessary
          break;
      }

      console.log(sInst);
    }
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
     * @type {function(): number}
     */
    this.addrMode = () => 0;

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
