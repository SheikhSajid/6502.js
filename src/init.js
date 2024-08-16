// Helper function to convert a number to a hexadecimal string with padding
function hex(number, length) {
  return number.toString(16).toUpperCase().padStart(length, '0');
}

const nes = new Bus();

// Function to draw text on the webpage
function drawString(text) {
  const div = document.createElement('div');
  div.style.fontFamily = 'monospace';
  div.style.fontSize = '16px';
  
  if (text.trim() === '') {
    div.innerHTML = '<br>';
  } else {
    div.textContent = text;
  }

  document.querySelector('.memory-container').appendChild(div);
}

function drawRam(nAddr, nRows, nColumns) {
  for (let row = 0; row < nRows; row++) {
    let sOffset = `$${hex(nAddr, 4)}:`;
    for (let col = 0; col < nColumns; col++) {
        sOffset += ` ${hex(nes.read(nAddr, true), 2)}`;
        nAddr += 1;
    }
    drawString(sOffset);
  }
}

function drawRegisters() {
  const statusElement = document.getElementById('status');
  const pcElement     = document.getElementById('pc');
  const aElement      = document.getElementById('a');
  const xElement      = document.getElementById('x');
  const yElement      = document.getElementById('y');

  statusElement.textContent = nes.cpu._status.toString(2).padStart(8, '0');
  pcElement.textContent     = nes.cpu._pc.toString(2).padStart(16, '0');
  aElement.textContent      = nes.cpu._a.toString(2).padStart(8, '0');
  xElement.textContent      = nes.cpu._x.toString(2).padStart(8, '0');
  yElement.textContent      = nes.cpu._y.toString(2).padStart(8, '0');
}

function draw() {
  drawRegisters();

  document.querySelector('.memory-container').innerHTML = '';
  drawRam(0x0000, 16, 16);
  drawString('');
  drawRam(0x8000, 16, 16);  
}

function runInstruction() {
  do {
    nes.cpu.clock();
  } while (!nes.cpu.complete());

  draw();
}

function reset(disassemble = false) {
    // Load Program (assembled at https://www.masswerk.at/6502/assembler.html)
		/*
			*=$8000
			LDX #10
			STX $0000
			LDX #3
			STX $0001
			LDY $0000
			LDA #0
			CLC
			loop
			ADC $0001
			DEY
			BNE loop
			STA $0002
			NOP
			NOP
			NOP
		*/

    // Convert hex string into bytes for RAM
    const hexString = "A2 0A 8E 00 00 A2 03 8E 01 00 AC 00 00 A9 00 18 6D 01 00 88 D0 FA 8D 02 00 EA EA EA";
    const bytes = hexString.split(" ").map(b => parseInt(b, 16));
    let nOffset = 0x8000;
    bytes.forEach(byte => {
        nes.ram[nOffset++] = byte;
    });

    // Set Reset Vector
    nes.ram[0xFFFC] = 0x00;
    nes.ram[0xFFFD] = 0x80;

    // Don't forget to set IRQ and NMI vectors if you want to play with those

    // Extract disassembly
    if (disassemble) {
      mapAsm = nes.cpu.disassemble(0x0000, 0xFFFF);
    }

    // Reset
    nes.cpu.reset();

    draw();

    return true;
}

reset();
