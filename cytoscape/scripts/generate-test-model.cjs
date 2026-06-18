const fs = require('fs');

const TYPES = ['cpu', 'bus', 'memory', 'peripheral', 'interface', 'clockReset', 'dma', 'interruptController', 'debug'];
const PREFIXES = {
  cpu: ['ARM Cortex-M', 'RISC-V Core', 'MIPS Processor'],
  bus: ['AXI Interconnect', 'AHB Bridge', 'APB Router', 'NoC Switch'],
  memory: ['SRAM', 'Flash', 'DRAM Controller', 'Cache'],
  peripheral: ['UART', 'SPI', 'I2C', 'GPIO', 'Timer', 'PWM'],
  interface: ['USB PHY', 'Ethernet MAC', 'PCIe Endpoint', 'JTAG'],
  clockReset: ['PLL', 'Clock Gen', 'Reset Controller'],
  dma: ['DMA Engine', 'DMA Controller'],
  interruptController: ['NVIC', 'GIC', 'PIC'],
  debug: ['JTAG', 'SWD', 'Trace Port']
};

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateModel(componentCount) {
  const components = [];
  const connections = [];
  const componentIds = [];

  for (let i = 0; i < componentCount; i++) {
    const type = pick(TYPES);
    const prefix = pick(PREFIXES[type]);
    const id = `${prefix.replace(/\s+/g, '_')}_${i}`;
    const name = `${prefix} ${i}`;
    componentIds.push(id);

    const portCount = 3 + Math.floor(Math.random() * 10);
    const ports = [];
    const portNames = ['clk', 'rst', 'addr', 'data', 'valid', 'ready', 'req', 'ack', 'irq', 'cs', 'wen', 'ren', 'txd', 'rxd'];
    for (let p = 0; p < portCount; p++) {
      const pname = pick(portNames) + (p > 0 ? `_p${p}` : '');
      ports.push({ id: pname, name: pname, direction: pick(['in', 'out', 'inout']) });
    }

    const regCount = Math.floor(Math.random() * 6);
    const registers = [];
    for (let r = 0; r < regCount; r++) {
      registers.push({ id: `REG_${r}`, name: `REG_${r}`, address: `0x${(r * 4).toString(16).toUpperCase()}` });
    }

    components.push({ id, name, type, ports, registers });
  }

  const edgeCount = Math.min(componentCount * 2, componentCount * (componentCount - 1) / 2);
  const edgeSet = new Set();

  for (let e = 0; e < edgeCount; e++) {
    let src, tgt;
    let attempts = 0;
    do {
      src = componentIds[Math.floor(Math.random() * componentIds.length)];
      tgt = componentIds[Math.floor(Math.random() * componentIds.length)];
      attempts++;
    } while ((src === tgt || edgeSet.has(`${src}->${tgt}`)) && attempts < 100);

    if (src !== tgt && !edgeSet.has(`${src}->${tgt}`)) {
      edgeSet.add(`${src}->${tgt}`);
      const srcComp = components.find(c => c.id === src);
      const tgtComp = components.find(c => c.id === tgt);
      connections.push({
        id: `conn_${e}`,
        source: srcComp.name,
        target: tgtComp.name
      });
    }
  }

  return { components: Object.fromEntries(components.map(c => [c.name, { type: c.type, ports: c.ports.map(p => p.name), registers: c.registers.map(r => r.name) }])), connections };
}

const count = parseInt(process.argv[2] || '100', 10);
const model = generateModel(count);
const output = JSON.stringify(model, null, 2);
fs.writeFileSync(`test-${count}-components.json`, output);
console.log(`Generated test-${count}-components.json with ${Object.keys(model.components).length} components and ${model.connections.length} connections`);
