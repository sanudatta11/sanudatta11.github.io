const bootScreen = document.getElementById('boot-screen');
const bootLog = document.getElementById('boot-log');
const enterSystem = document.getElementById('enter-system');
const app = document.getElementById('app');

const menuToggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
const navLinks = [...document.querySelectorAll('.menu a')];

const palette = document.getElementById('command-palette');
const paletteOpenBtn = document.getElementById('palette-open');
const paletteButtons = [...document.querySelectorAll('.palette-panel button')];

const tabs = [...document.querySelectorAll('.tab')];
const panels = [...document.querySelectorAll('.panel-wrap')];

const terminalOutput = document.getElementById('terminal-output');
const terminalForm = document.getElementById('terminal-form');
const terminalInput = document.getElementById('terminal-input');
let terminalHistory = [];
let historyIndex = -1;
let paletteLastFocus = null;

const revealItems = [...document.querySelectorAll('.reveal')];
const counters = [...document.querySelectorAll('.counter')];
const sections = [...document.querySelectorAll('main section[id], footer[id]')];
const tiltCards = [...document.querySelectorAll('.tilt-card')];
const scrollProgress = document.querySelector('.scroll-progress');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const glitch = document.querySelector('.glitch');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const bootLines = [
  'Boot sequence started...',
  '[OK] Initializing secure runtime',
  '[OK] Loading cloud telemetry modules',
  '[OK] Mounting backend services',
  '[OK] Building command kernel',
  '[OK] Network uplink established',
  '[OK] Authenticated as SOUMYAJIT_DUTTA',
  '> System ready. Awaiting operator input.'
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runBootSequence() {
  if (!bootLog) return;
  bootLog.textContent = '';

  for (const line of bootLines) {
    for (const char of line) {
      bootLog.textContent += char;
      if (!reduceMotion) await sleep(8);
    }
    bootLog.textContent += '\n';
    if (!reduceMotion) await sleep(110);
  }

  enterSystem.disabled = false;
}

function unlockSystem() {
  bootScreen?.classList.add('hidden');
  app?.classList.remove('app-hidden');
  app?.classList.add('app-ready');
  setTimeout(() => terminalInput?.focus(), 150);
}

enterSystem?.addEventListener('click', unlockSystem);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !bootScreen?.classList.contains('hidden') && !enterSystem?.disabled) {
    unlockSystem();
  }
});

menuToggle?.addEventListener('click', () => {
  const open = menu?.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(Boolean(open)));
});

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    if (!id?.startsWith('#')) return;
    const target = document.querySelector(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    menu?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

function setActiveTab(nextId) {
  tabs.forEach((tab) => {
    const active = tab.dataset.panel === nextId;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });

  panels.forEach((panel) => {
    const active = panel.id === nextId;
    panel.classList.toggle('active', active);
    panel.setAttribute('aria-hidden', String(!active));
  });
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    setActiveTab(tab.dataset.panel);
  });
});

function appendLine(text, className = '') {
  if (!terminalOutput) return;
  const line = document.createElement('div');
  line.textContent = text;
  if (className) line.className = className;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function appendLines(lines) {
  lines.forEach((line) => appendLine(line));
}

const virtualFiles = {
  'README.md': [
    '# Soumyajit Command Center',
    'Backend + DevOps engineer profile terminal.',
    'Type: help'
  ],
  'skills.txt': [
    'Go',
    'Python',
    'JavaScript',
    'AWS',
    'Kubernetes',
    'Kafka',
    'CI/CD',
    'Data Security'
  ],
  'experience.txt': [
    'Capital One - Principal Associate (Jun 2024 - Present)',
    'IDFC FIRST Bank - Senior SDE (Jan 2022 - Jun 2024)',
    'Convosight - SDE (Jul 2020 - Jan 2022)',
    'Amazon - SDE, Payment Services (Jan 2020 - Aug 2020)',
    'AWS - Cloud Support Associate (Sep 2019 - Jan 2020)'
  ],
  'contact.txt': [
    'Email: sanudatta11@gmail.com',
    'Phone: [REDACTED]',
    'LinkedIn: https://www.linkedin.com/in/soumyajit-dutta-coder'
  ]
};

const virtualDirectories = {
  '/home/soumy': ['README.md', 'skills.txt', 'experience.txt', 'contact.txt', 'projects/'],
  '/home/soumy/projects': ['limits-platform/', 'analytics-platform/', 'security-tools/']
};

let currentDir = '/home/soumy';

function resolvePath(pathArg) {
  if (!pathArg || pathArg === '~') return '/home/soumy';
  if (pathArg === '.') return currentDir;
  if (pathArg === '..') {
    if (currentDir === '/home/soumy/projects') return '/home/soumy';
    return currentDir;
  }
  if (pathArg.startsWith('/')) return pathArg;
  if (pathArg === 'projects' || pathArg === 'projects/') return '/home/soumy/projects';
  return `${currentDir}/${pathArg}`;
}

function runTerminalCommand(rawInput) {
  const tokens = rawInput.trim().split(/\s+/);
  const cmd = (tokens[0] || '').toLowerCase();
  const args = tokens.slice(1);

  if (!cmd) return;

  if (cmd === 'clear') {
    terminalOutput.textContent = '';
    return;
  }

  if (cmd === 'help') {
    appendLines([
      'Basic commands: pwd, ls, cd, cat, echo, date, uname, whoami, clear',
      'Extra commands: tree, neofetch, open <linkedin|email>',
      'Profile commands: about, stack, experience, contact, linkedin, email',
      'Tips: use ArrowUp / ArrowDown for history'
    ]);
    return;
  }

  if (cmd === 'pwd') {
    appendLine(currentDir);
    return;
  }

  if (cmd === 'ls') {
    const targetDir = resolvePath(args[0] || '.');
    const entries = virtualDirectories[targetDir];
    if (!entries) {
      appendLine(`ls: cannot access '${args[0] || '.'}': No such file or directory`);
      return;
    }
    appendLine(entries.join('  '));
    return;
  }

  if (cmd === 'cd') {
    const targetDir = resolvePath(args[0] || '~');
    if (!virtualDirectories[targetDir]) {
      appendLine(`cd: no such file or directory: ${args[0] || '~'}`);
      return;
    }
    currentDir = targetDir;
    return;
  }

  if (cmd === 'cat') {
    const fileArg = args[0];
    if (!fileArg) {
      appendLine('cat: missing operand');
      return;
    }
    const fileName = fileArg.split('/').pop();
    const content = virtualFiles[fileName];
    if (!content) {
      appendLine(`cat: ${fileArg}: No such file`);
      return;
    }
    appendLines(content);
    return;
  }

  if (cmd === 'echo') {
    appendLine(rawInput.slice(5));
    return;
  }

  if (cmd === 'date') {
    appendLine(new Date().toString());
    return;
  }

  if (cmd === 'uname') {
    if (args[0] === '-a') {
      appendLine('Linux soumy-node 6.8.0-portfolio #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux');
    } else {
      appendLine('Linux');
    }
    return;
  }

  if (cmd === 'whoami') {
    appendLine('soumyajit');
    return;
  }

  if (cmd === 'tree') {
    appendLines([
      '/home/soumy',
      '|-- README.md',
      '|-- skills.txt',
      '|-- experience.txt',
      '|-- contact.txt',
      '`-- projects',
      '    |-- limits-platform',
      '    |-- analytics-platform',
      '    `-- security-tools'
    ]);
    return;
  }

  if (cmd === 'neofetch') {
    appendLines([
      'soumy@node',
      '-----------',
      'Role: Backend Developer / DevOps Engineer',
      'Experience: 6+ years',
      'Stack: Go, Python, JavaScript, AWS, Kubernetes, Kafka',
      'Focus: Data Security, Platform Engineering'
    ]);
    return;
  }

  if (cmd === 'open') {
    const target = (args[0] || '').toLowerCase();
    if (target === 'linkedin') {
      window.open('https://www.linkedin.com/in/soumyajit-dutta-coder', '_blank', 'noopener');
      appendLine('Opening LinkedIn...');
      return;
    }
    if (target === 'email') {
      window.location.href = 'mailto:sanudatta11@gmail.com';
      appendLine('Opening mail client...');
      return;
    }
    appendLine('open: usage -> open <linkedin|email>');
    return;
  }

  if (cmd === 'about') {
    appendLine('Soumyajit Dutta | Backend + DevOps | Principal Associate @ Capital One');
    return;
  }

  if (cmd === 'stack') {
    appendLine('Go | Python | JavaScript | AWS | Kubernetes | Kafka | CI/CD | Data Security');
    return;
  }

  if (cmd === 'experience') {
    appendLine('6+ years across Capital One, IDFC FIRST Bank, Convosight, Amazon, AWS');
    return;
  }

  if (cmd === 'contact') {
    appendLine('Email: sanudatta11@gmail.com | Phone: [REDACTED] | LinkedIn: /in/soumyajit-dutta-coder');
    return;
  }

  if (cmd === 'linkedin') {
    window.open('https://www.linkedin.com/in/soumyajit-dutta-coder', '_blank', 'noopener');
    appendLine('Opening LinkedIn...');
    return;
  }

  if (cmd === 'email') {
    window.location.href = 'mailto:sanudatta11@gmail.com';
    appendLine('Opening mail client...');
    return;
  }

  appendLine(`${cmd}: command not found. Type 'help'.`);
}

terminalForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const raw = (terminalInput.value || '').trim();
  if (!raw) return;

  terminalHistory.push(raw);
  historyIndex = terminalHistory.length;

  appendLine(`soumy@node:${currentDir.replace('/home/soumy', '~')}$ ${raw}`, 'prompt-line');
  runTerminalCommand(raw);
  terminalInput.value = '';
});

terminalInput?.addEventListener('keydown', (event) => {
  if (!terminalHistory.length) return;

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    historyIndex = Math.max(0, historyIndex - 1);
    terminalInput.value = terminalHistory[historyIndex] || '';
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    historyIndex = Math.min(terminalHistory.length, historyIndex + 1);
    terminalInput.value = historyIndex >= terminalHistory.length ? '' : terminalHistory[historyIndex];
  }
});

function openPalette() {
  paletteLastFocus = document.activeElement;
  palette?.classList.add('open');
  palette?.setAttribute('aria-hidden', 'false');
  paletteButtons[0]?.focus();
}

function closePalette() {
  palette?.classList.remove('open');
  palette?.setAttribute('aria-hidden', 'true');
  if (paletteLastFocus && typeof paletteLastFocus.focus === 'function') {
    paletteLastFocus.focus();
  }
}

paletteOpenBtn?.addEventListener('click', openPalette);

paletteButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    closePalette();

    if (action === 'goto-hero') document.getElementById('hero')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    if (action === 'goto-missions') document.getElementById('missions')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    if (action === 'goto-contact') document.getElementById('contact')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    if (action === 'open-linkedin') window.open('https://www.linkedin.com/in/soumyajit-dutta-coder', '_blank', 'noopener');
    if (action === 'open-mail') window.location.href = 'mailto:sanudatta11@gmail.com';
  });
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePalette();

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (palette?.classList.contains('open')) closePalette();
    else openPalette();
  }
});

palette?.addEventListener('click', (event) => {
  if (event.target === palette) closePalette();
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('show');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.14 });

revealItems.forEach((item) => revealObserver.observe(item));

const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const element = entry.target;
    const target = Number(element.dataset.target || '0');
    const start = performance.now();
    const duration = 1100;

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      element.textContent = String(Math.floor(target * progress));
      if (progress < 1) requestAnimationFrame(frame);
      else element.textContent = String(target);
    };

    requestAnimationFrame(frame);
    observer.unobserve(element);
  });
}, { threshold: 0.4 });

counters.forEach((counter) => counterObserver.observe(counter));

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  });
}, { threshold: 0.5, rootMargin: '-15% 0px -35% 0px' });

sections.forEach((section) => sectionObserver.observe(section));

if (!reduceMotion) {
  let rafPending = false;

  window.addEventListener('pointermove', (event) => {
    if (rafPending) return;
    rafPending = true;

    requestAnimationFrame(() => {
      const x = event.clientX;
      const y = event.clientY;

      const tiltX = (x / window.innerWidth - 0.5) * 14;
      const tiltY = (y / window.innerHeight - 0.5) * 14;
      document.documentElement.style.setProperty('--mx', `${tiltX}px`);
      document.documentElement.style.setProperty('--my', `${tiltY}px`);

      if (cursorDot) cursorDot.style.transform = `translate(${x}px, ${y}px)`;
      if (cursorRing) cursorRing.style.transform = `translate(${x}px, ${y}px)`;

      rafPending = false;
    });
  });

  document.querySelectorAll('a, button, input').forEach((element) => {
    element.addEventListener('mouseenter', () => {
      if (!cursorRing) return;
      cursorRing.style.width = '42px';
      cursorRing.style.height = '42px';
      cursorRing.style.boxShadow = '0 0 24px rgba(255, 74, 216, 0.65), 0 0 36px rgba(78, 203, 255, 0.8), inset 0 0 12px rgba(255,255,255,0.2)';
    });
    element.addEventListener('mouseleave', () => {
      if (!cursorRing) return;
      cursorRing.style.width = '32px';
      cursorRing.style.height = '32px';
      cursorRing.style.boxShadow = '0 0 18px rgba(255, 74, 216, 0.45), 0 0 28px rgba(78, 203, 255, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.12)';
    });
  });

  tiltCards.forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const cx = event.clientX - rect.left;
      const cy = event.clientY - rect.top;
      const rx = ((cy / rect.height) - 0.5) * -8;
      const ry = ((cx / rect.width) - 0.5) * 8;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  setInterval(() => {
    if (!glitch) return;
    glitch.classList.add('flicker');
    setTimeout(() => glitch.classList.remove('flicker'), 120);
  }, 2600);
}

window.addEventListener('scroll', () => {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? window.scrollY / docHeight : 0;
  if (scrollProgress) scrollProgress.style.transform = `scaleX(${pct})`;
});

appendLine('Interactive terminal online. Type "help" to list commands.');
runBootSequence();

