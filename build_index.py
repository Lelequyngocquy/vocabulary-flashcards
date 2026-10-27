import json
import os

with open(r'D:\Vocab_Web\database.json', 'r', encoding='utf-8') as f:
    words_data = json.load(f)

json_str = json.dumps(words_data, ensure_ascii=False)

html_template = """<!DOCTYPE html>
<html lang="vi" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>IELTS Vocab Mastery | Voltagent Engineering Design</title>
  <meta name="description" content="Nền tảng học từ vựng IELTS phong cách Voltagent: Dark canvas #101010, Electric Green #00d992, Hairline #3d3a39, tối ưu di động">
  <meta name="theme-color" content="#101010">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

  <!-- Google Fonts: Inter & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: {
              DEFAULT: '#00d992',
              soft: '#2fd6a1',
              deep: '#10b981',
              on: '#101010'
            },
            canvas: {
              DEFAULT: '#101010',
              soft: '#1a1a1a',
              textSoft: '#f5f6f7'
            },
            hairline: {
              DEFAULT: '#3d3a39',
              soft: '#b8b3b0'
            },
            ink: {
              DEFAULT: '#f2f2f2',
              strong: '#ffffff'
            },
            body: '#bdbdbd',
            mute: '#8b949e'
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'monospace']
          },
          borderRadius: {
            sm: '6px',
            md: '8px',
            pill: '9999px'
          }
        }
      }
    }
  </script>

  <!-- Confetti -->
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>

  <style>
    html, body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background-color: #101010;
      color: #f2f2f2;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
      -webkit-user-select: none;
      overflow-x: hidden;
      touch-action: manipulation;
      -webkit-text-size-adjust: 100%;
    }
    *, *::before, *::after {
      touch-action: manipulation;
    }
    button, a, input, select, textarea, [role="button"], .tap-bounce, .perspective-1000, #flashcardInner {
      touch-action: manipulation;
      -ms-touch-action: manipulation;
      -webkit-touch-callout: none;
    }
    .perspective-1000 {
      perspective: 1200px;
    }
    .transform-style-3d {
      transform-style: preserve-3d;
    }
    .backface-hidden {
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    .rotate-y-180 {
      transform: rotateY(180deg);
    }
    .card-transition {
      transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .slide-out-left {
      animation: cardSlideOutLeft 0.16s cubic-bezier(0.4, 0, 0.7, 1) forwards;
    }
    .slide-in-right {
      animation: cardSlideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .slide-out-right {
      animation: cardSlideOutRight 0.16s cubic-bezier(0.4, 0, 0.7, 1) forwards;
    }
    .slide-in-left {
      animation: cardSlideInLeft 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes cardSlideOutLeft {
      0% { transform: translateX(0); opacity: 1; }
      100% { transform: translateX(-80px) scale(0.97); opacity: 0; }
    }
    @keyframes cardSlideInRight {
      0% { transform: translateX(80px) scale(0.97); opacity: 0; }
      100% { transform: translateX(0) scale(1); opacity: 1; }
    }
    @keyframes cardSlideOutRight {
      0% { transform: translateX(0); opacity: 1; }
      100% { transform: translateX(80px) scale(0.97); opacity: 0; }
    }
    @keyframes cardSlideInLeft {
      0% { transform: translateX(-80px) scale(0.97); opacity: 0; }
      100% { transform: translateX(0) scale(1); opacity: 1; }
    }
    ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }
    ::-webkit-scrollbar-track {
      background: #101010;
    }
    ::-webkit-scrollbar-thumb {
      background: #3d3a39;
      border-radius: 4px;
    }
    .tap-bounce {
      transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .tap-bounce:active {
      transform: scale(0.97);
    }
    .dashed-divider {
      border-top: 1px dashed rgba(79, 93, 117, 0.4);
    }
    @keyframes soundwave {
      0%, 100% { height: 4px; }
      50% { height: 16px; }
    }
    .soundwave-bar:nth-child(1) { animation: soundwave 0.8s ease-in-out infinite; }
    .soundwave-bar:nth-child(2) { animation: soundwave 0.8s ease-in-out infinite 0.2s; }
    .soundwave-bar:nth-child(3) { animation: soundwave 0.8s ease-in-out infinite 0.4s; }
    .soundwave-bar:nth-child(4) { animation: soundwave 0.8s ease-in-out infinite 0.1s; }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* DICTIONARY VIEW: PINNED HEADER & FILTER CARD + INDEPENDENT SCROLLING LIST */
    body.dictionary-mode {
      height: 100vh;
      height: 100dvh;
      overflow: hidden !important;
      padding-bottom: 0 !important;
    }
    body.dictionary-mode main {
      height: calc(100vh - 53px);
      height: calc(100dvh - 53px);
      min-height: 0 !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      padding-bottom: 4.5rem !important; /* Spacing for mobile bottom navigation */
    }
    @media (min-width: 768px) {
      body.dictionary-mode main {
        height: calc(100vh - 57px);
        height: calc(100dvh - 57px);
        padding-bottom: 1.25rem !important;
      }
    }
    body.dictionary-mode #tab-list {
      display: flex !important;
      flex-direction: column !important;
      flex: 1 1 0% !important;
      height: 100% !important;
      min-height: 0 !important;
      overflow: hidden !important;
    }
    body.dictionary-mode #dictFilterCard {
      flex-shrink: 0 !important;
    }
    body.dictionary-mode #dictListContainer {
      flex: 1 1 0% !important;
      min-height: 0 !important;
      height: 100% !important;
      max-height: 100% !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      -webkit-overflow-scrolling: touch !important;
      touch-action: pan-y !important;
    }
    /* TYPE OF WORD BADGES: DISTINCTIVE COLOR PALETTE */
    .badge-pos-noun {
      background-color: rgba(56, 189, 248, 0.12) !important;
      color: #38bdf8 !important;
      border-color: rgba(56, 189, 248, 0.35) !important;
    }
    .badge-pos-verb {
      background-color: rgba(52, 211, 153, 0.12) !important;
      color: #34d399 !important;
      border-color: rgba(52, 211, 153, 0.35) !important;
    }
    .badge-pos-adj {
      background-color: rgba(192, 132, 252, 0.12) !important;
      color: #c084fc !important;
      border-color: rgba(192, 132, 252, 0.35) !important;
    }
    .badge-pos-adv {
      background-color: rgba(251, 191, 36, 0.12) !important;
      color: #fbbf24 !important;
      border-color: rgba(251, 191, 36, 0.35) !important;
    }
    .badge-pos-phrase {
      background-color: rgba(251, 113, 133, 0.12) !important;
      color: #fb7185 !important;
      border-color: rgba(251, 113, 133, 0.35) !important;
    }
    .badge-pos-idiom {
      background-color: rgba(232, 121, 249, 0.12) !important;
      color: #e879f9 !important;
      border-color: rgba(232, 121, 249, 0.35) !important;
    }
    .badge-pos-default {
      background-color: rgba(161, 161, 170, 0.12) !important;
      color: #a1a1aa !important;
      border-color: rgba(161, 161, 170, 0.35) !important;
    }
  </style>
</head>
<body class="min-h-screen min-h-[100dvh] flex flex-col bg-canvas text-ink selection:bg-primary selection:text-primary-on pb-28 md:pb-8">

  <!-- FLOATING VOLTAGENT SYNC TOAST -->
  <div id="syncToast" class="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 opacity-0 -translate-y-3">
    <div class="px-3.5 py-1.5 rounded-[6px] bg-canvas-soft border border-primary text-ink text-xs font-mono font-medium flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
      <span id="syncToastText">SYNC_OK</span>
    </div>
  </div>

  <!-- VOLTAGENT TOP NAV BAR (Hairline border on dark canvas) -->
  <header class="sticky top-0 z-40 bg-canvas border-b border-hairline px-3 py-2.5 sm:px-6">
    <div class="max-w-5xl mx-auto flex items-center justify-between gap-2">
      
      <!-- Brand Logo (Lightning Glyph + Voltagent Aesthetic) -->
      <div class="flex items-center gap-2 cursor-pointer tap-bounce flex-shrink-0" onclick="playTapSound(); switchTab('flashcards')">
        <div class="w-8 h-8 rounded-[6px] bg-canvas-soft border border-hairline flex items-center justify-center text-primary shadow-sm font-bold text-sm">
          <svg class="w-4 h-4 fill-current text-primary" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
        </div>
        <div class="hidden sm:block">
          <div class="flex items-center gap-1.5">
            <span class="font-bold tracking-tight text-ink-strong text-sm">VOLT<span class="text-primary font-normal">VOCAB</span></span>
            <span class="text-[10px] font-mono px-1.5 py-0.2 rounded-[4px] bg-canvas-soft text-primary border border-hairline uppercase tracking-wider">v2.4</span>
          </div>
        </div>
      </div>

      <!-- Unit Selector Dropdown (Clean, hairline border, no bubbly rounded) -->
      <div class="flex-1 min-w-0 max-w-[210px] sm:max-w-xs md:max-w-sm mx-1">
        <div class="relative">
          <select id="unitSelect" onchange="playTapSound(); onUnitChange(this.value)" class="w-full bg-canvas-soft hover:bg-canvas text-ink text-xs sm:text-sm font-medium rounded-[6px] border border-hairline px-2.5 py-1.5 pr-6 focus:outline-none focus:border-primary transition-all cursor-pointer appearance-none truncate font-sans">
            <!-- Populated via JS -->
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-mute">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>

      <!-- Right Header Actions (Mute + Auth + Desktop Nav) -->
      <div class="flex items-center gap-1.5 flex-shrink-0">
        
        <!-- Sound Toggle -->
        <button onclick="toggleSoundMute()" id="soundMuteBtn" class="p-1.5 rounded-[6px] bg-canvas-soft hover:bg-canvas border border-hairline text-mute hover:text-ink transition-all tap-bounce" title="Audio">
          <span id="soundMuteIcon" class="text-xs">🔔</span>
        </button>

        <!-- User Profile / Login -->
        <div id="authSection" class="relative">
          <button onclick="playTapSound(); openAuthModal('login')" id="btnLoginHeader" class="py-1.5 px-3 rounded-[6px] bg-primary hover:bg-primary-soft text-primary-on font-semibold text-xs shadow-sm transition-all tap-bounce flex items-center gap-1 font-mono">
            <span>LOGIN</span>
          </button>

          <button onclick="playTapSound(); toggleUserMenu()" id="userProfileHeader" class="hidden items-center gap-1.5 bg-canvas-soft hover:bg-canvas border border-hairline py-1 px-2.5 rounded-[6px] text-xs font-mono text-ink tap-bounce cursor-pointer">
            <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
            <span id="headerUsername" class="max-w-[70px] sm:max-w-[100px] truncate font-semibold">user</span>
            <svg class="w-3 h-3 text-mute" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          <!-- Dropdown Menu -->
          <div id="userDropdownMenu" class="hidden absolute right-0 mt-2 w-48 rounded-[8px] bg-canvas border border-hairline shadow-2xl p-2 z-50">
            <div class="px-2.5 py-1.5 border-b border-hairline mb-1">
              <div class="text-[10px] text-mute uppercase tracking-widest font-mono">USER_ID</div>
              <div id="menuUsername" class="font-mono text-ink-strong text-xs truncate">user</div>
            </div>
            <div class="px-2.5 py-1 text-[11px] text-primary flex items-center gap-1.5 font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span>DB_SYNCED</span>
            </div>
            <button onclick="playTapSound(); logoutUser()" class="w-full mt-1.5 px-2.5 py-1.5 rounded-[6px] bg-canvas-soft hover:bg-canvas text-rose-400 border border-hairline font-mono text-xs flex items-center gap-1.5 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              <span>LOGOUT</span>
            </button>
          </div>
        </div>

        <!-- Desktop Nav Tabs -->
        <nav class="hidden md:flex items-center gap-1 bg-canvas-soft p-1 rounded-[6px] border border-hairline text-xs font-medium ml-1">
          <button id="nav-flashcards" onclick="playTapSound(); switchTab('flashcards')" class="px-3 py-1 rounded-[4px] transition-all bg-primary text-primary-on font-semibold">
            Flashcards
          </button>
          <button id="nav-quiz" onclick="playTapSound(); switchTab('quiz')" class="px-3 py-1 rounded-[4px] transition-all text-body hover:text-ink">
            Quiz
          </button>
          <button id="nav-list" onclick="playTapSound(); switchTab('list')" class="px-3 py-1 rounded-[4px] transition-all text-body hover:text-ink">
            Dictionary
          </button>
          <button id="nav-stats" onclick="playTapSound(); switchTab('stats')" class="px-3 py-1 rounded-[4px] transition-all text-body hover:text-ink">
            Metrics
          </button>
        </nav>

      </div>

    </div>
  </header>

  <!-- AUTH MODAL (Voltagent ex-auth-form-card & ex-modal-card specification) -->
  <div id="authModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm hidden">
    <div class="relative w-full max-w-sm rounded-[8px] bg-canvas border border-hairline shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 space-y-4">
      <button onclick="playTapSound(); closeAuthModal()" class="absolute top-4 right-4 text-mute hover:text-ink p-1 rounded hover:bg-canvas-soft">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <div>
        <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-canvas-soft border border-hairline text-primary font-mono text-[11px] mb-2">
          <span>⚡</span> VOLTAGENT AUTH
        </div>
        <h3 id="authModalTitle" class="text-xl font-normal text-ink-strong tracking-tight">Sign in to workspace</h3>
        <p class="text-xs text-body mt-1">Persistent user storage across devices via SQLite database.</p>
      </div>

      <!-- Mode Switcher -->
      <div class="grid grid-cols-2 p-0.5 bg-canvas-soft rounded-[6px] border border-hairline text-xs font-medium">
        <button id="tabAuthLogin" onclick="playTapSound(); setAuthMode('login')" class="py-1.5 rounded-[4px] bg-primary text-primary-on font-semibold transition-all">
          Sign In
        </button>
        <button id="tabAuthRegister" onclick="playTapSound(); setAuthMode('register')" class="py-1.5 rounded-[4px] text-body hover:text-ink transition-all">
          Register
        </button>
      </div>

      <div id="authErrorBox" class="hidden p-2.5 rounded-[6px] bg-canvas-soft border border-rose-500/50 text-rose-300 text-xs font-mono">
      </div>

      <form onsubmit="handleAuthSubmit(event)" class="space-y-3">
        <div>
          <label class="text-[11px] font-mono text-mute block mb-1 uppercase tracking-wider">Username</label>
          <input type="text" id="authUsername" required placeholder="developer_id" class="w-full bg-canvas-soft text-ink text-xs sm:text-sm rounded-[6px] border border-hairline px-3 py-2 focus:outline-none focus:border-primary transition-all font-mono placeholder:text-mute/60">
        </div>

        <div>
          <label class="text-[11px] font-mono text-mute block mb-1 uppercase tracking-wider">Password</label>
          <input type="password" id="authPassword" required placeholder="••••••••" class="w-full bg-canvas-soft text-ink text-xs sm:text-sm rounded-[6px] border border-hairline px-3 py-2 focus:outline-none focus:border-primary transition-all font-mono placeholder:text-mute/60">
        </div>

        <div class="flex items-center justify-between text-xs pt-0.5">
          <span class="text-mute text-[11px] font-mono">256-bit SSL</span>
          <button type="button" onclick="playTapSound(); openForgotPassModal()" class="text-primary hover:underline text-xs font-mono">
            Forgot password?
          </button>
        </div>

        <button type="submit" id="authSubmitBtn" class="w-full py-2.5 rounded-[6px] bg-primary hover:bg-primary-soft text-primary-on font-semibold text-xs sm:text-sm transition-all tap-bounce font-mono uppercase tracking-wider">
          Continue ➔
        </button>
      </form>

      <div class="text-center pt-1 border-t border-hairline">
        <button onclick="playTapSound(); continueAsGuest()" class="text-xs text-mute hover:text-ink transition-colors font-mono">
          [ Continue as guest ]
        </button>
      </div>
    </div>
  </div>

  <!-- FORGOT PASSWORD MODAL -->
  <div id="forgotPassModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm hidden">
    <div class="relative w-full max-w-sm rounded-[8px] bg-canvas border border-hairline shadow-2xl p-6 text-center space-y-4">
      <div class="w-10 h-10 rounded-[6px] bg-canvas-soft border border-hairline text-primary mx-auto flex items-center justify-center text-lg font-mono">
        ?
      </div>
      <div>
        <h3 class="text-lg font-normal text-ink-strong tracking-tight">Account Recovery</h3>
        <p class="text-xs text-body mt-1 leading-relaxed">
          Contact administrator directly via hotline or Zalo to reset your credentials:
        </p>
      </div>

      <div class="p-3.5 rounded-[6px] bg-canvas-soft border border-hairline space-y-1">
        <div class="text-[10px] text-mute uppercase tracking-widest font-mono">DIRECT HOTLINE / ZALO</div>
        <div class="text-xl font-bold font-mono text-primary tracking-wider">
          0961684809
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
        <a href="tel:0961684809" onclick="playTapSound()" class="py-2 px-3 rounded-[6px] bg-primary text-primary-on font-semibold flex items-center justify-center gap-1 tap-bounce">
          <span>Call Admin</span>
        </a>
        <button onclick="playTapSound(); closeForgotPassModal()" class="py-2 px-3 rounded-[6px] bg-canvas-soft hover:bg-canvas text-ink border border-hairline tap-bounce">
          Dismiss
        </button>
      </div>
    </div>
  </div>

  <!-- MAIN VIEW CONTAINER -->
  <main class="flex-1 max-w-xl w-full mx-auto p-3 sm:p-5 flex flex-col justify-start">

    <!-- TAB 1: FLASHCARDS (Voltagent Hairline Card) -->
    <section id="tab-flashcards" class="flex flex-col flex-1 w-full justify-between">
      
      <!-- Top Eyebrow & Metric Progress Bar -->
      <div class="mb-3">
        <div class="flex items-center justify-between text-xs font-mono mb-1.5">
          <span id="fcUnitTitle" class="truncate max-w-[220px] sm:max-w-xs text-primary font-semibold tracking-wide">Unit 1: Growing Up</span>
          <span id="fcCounter" class="text-mute font-mono">01 / 51</span>
        </div>
        <!-- Progress bar (Voltagent primary accent) -->
        <div class="w-full bg-canvas-soft h-1 rounded-none border-b border-hairline">
          <div id="fcProgressBar" class="bg-primary h-full transition-all duration-300" style="width: 2%"></div>
        </div>
      </div>

      <!-- 3D FLIP CARD (Voltagent card-feature: 1px hairline border, #101010 canvas) -->
      <div id="flashcardWrapper" class="perspective-1000 w-full min-h-[320px] sm:min-h-[360px] select-none cursor-pointer my-auto" onclick="toggleFlipCard()">
        <div id="flashcardInner" class="relative w-full h-full transform-style-3d card-transition min-h-[320px] sm:min-h-[360px] rounded-[10px] border border-hairline bg-canvas">

          <!-- FRONT OF CARD -->
          <div class="absolute inset-0 w-full h-full backface-hidden rounded-[10px] p-4 sm:p-6 md:p-7 flex flex-col justify-between overflow-hidden bg-canvas border border-hairline">
            <!-- Front Top Metadata -->
            <div class="flex items-center justify-between">
              <span id="fcFrontType" class="px-2.5 py-1 rounded-[4px] text-xs sm:text-sm font-mono font-medium uppercase tracking-wider border badge-pos-noun">
                noun
              </span>
              <div id="fcFrontLearnedIndicator" class="flex items-center gap-1.5 text-xs sm:text-sm font-mono px-2.5 py-1 rounded-[4px] bg-canvas-soft text-mute border border-hairline">
                <span id="fcFrontLearnedIcon">○</span>
                <span id="fcFrontLearnedLabel">LEARNING</span>
              </div>
            </div>

            <!-- Front Center (Word in Calm Display Typo) -->
            <div class="my-auto text-center py-2 sm:py-4 flex-1 flex flex-col justify-center items-center">
              <h2 id="fcWord" class="text-4xl sm:text-6xl md:text-7xl font-bold text-ink-strong tracking-[-0.8px] leading-tight font-sans break-words max-w-full">
                Unparalleled
              </h2>
              <div class="inline-flex items-center gap-2 mt-2 sm:mt-3 text-xs sm:text-sm font-mono text-mute">
                <span class="w-2 h-2 rounded-full bg-primary"></span>
                <span>CAMBRIDGE VOCABULARY SPEC</span>
              </div>
            </div>

            <!-- Front Bottom Eyebrow -->
            <div class="text-center text-xs sm:text-sm text-mute flex items-center justify-center gap-1.5 font-mono uppercase tracking-[2.52px] pt-3 border-t border-hairline/60">
              <span class="text-primary text-sm font-bold">➔</span>
              <span>CHẠM ĐỂ XEM ĐỊNH NGHĨA</span>
            </div>
          </div>

          <!-- BACK OF CARD -->
          <div class="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-[10px] p-4 sm:p-6 md:p-7 flex flex-col justify-between overflow-hidden bg-canvas border border-hairline">
            <!-- Back Top Bar -->
            <div class="flex items-center justify-between pb-2 border-b border-hairline gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span id="fcBackWord" class="font-sans font-bold text-lg sm:text-2xl text-ink-strong truncate max-w-[180px] sm:max-w-xs">Unparalleled</span>
                <span id="fcBackType" class="text-xs font-mono px-2 py-0.5 rounded uppercase border font-medium shrink-0 badge-pos-adj">adj</span>
              </div>
              <div id="fcBackLearnedIndicator" class="flex items-center gap-1.5 text-xs sm:text-sm font-mono px-2.5 py-1 rounded-[4px] bg-canvas-soft text-mute border border-hairline shrink-0">
                <span id="fcBackLearnedIcon">○</span>
                <span id="fcBackLearnedLabel">LEARNING</span>
              </div>
            </div>

            <!-- Meaning & IELTS Code Mockup Container -->
            <div class="my-auto py-1.5 sm:py-2.5 space-y-2 sm:space-y-3 min-h-0 flex-1 flex flex-col justify-center">
              <div>
                <p class="text-[10px] sm:text-[11px] font-mono text-mute uppercase tracking-[2px] mb-1 font-medium">VIETNAMESE DEFINITION</p>
                <p id="fcMeaning" class="text-xl sm:text-2xl md:text-3xl font-bold text-primary leading-snug font-sans">
                  Không thể so sánh / Vô song
                </p>
              </div>

              <!-- Context Example (Voltagent code-mockup styling: #1a1a1a fill with hairline) -->
              <div id="fcExampleContainer" class="bg-canvas-soft p-2.5 sm:p-3.5 rounded-[8px] border border-hairline">
                <div class="flex items-center justify-between mb-1 gap-2">
                  <div class="text-[10px] sm:text-[11px] font-mono text-mute uppercase tracking-widest font-medium flex items-center gap-1.5 flex-1 min-w-0">
                    <span class="text-primary font-bold">//</span>
                    <span>IELTS CONTEXT EXAMPLE</span>
                  </div>
                  <div class="flex items-center gap-1 shrink-0 -mr-0.5">
                    <button type="button" onclick="speakExampleSentence(event)" id="fcSpeakExampleBtn" class="p-1 rounded-[4px] hover:bg-canvas text-mute hover:text-primary transition-all tap-bounce flex items-center justify-center cursor-pointer" title="Listen to example">
                      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    </button>
                    <button type="button" onclick="copyExampleText(event)" id="fcCopyExampleBtn" class="p-1 rounded-[4px] hover:bg-canvas text-mute hover:text-primary transition-all tap-bounce flex items-center justify-center cursor-pointer" title="Copy example">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <p id="fcExample" class="text-xs sm:text-sm md:text-base text-body leading-snug sm:leading-relaxed font-sans font-normal line-clamp-3">
                  The historical archives offer an unparalleled insight into the socio-economic transformations.
                </p>
              </div>
            </div>

            <!-- Back Bottom Eyebrow -->
            <div class="text-center text-xs sm:text-sm text-mute flex items-center justify-center gap-1.5 font-mono uppercase tracking-[2.52px] pt-2.5 border-t border-hairline/60">
              <span class="text-primary text-sm font-bold">➔</span>
              <span>CHẠM ĐỂ QUAY LẠI TỪ VỰNG</span>
            </div>
          </div>

        </div>

        <!-- EMPTY STATE (Khi tất cả từ trong filter đã thuộc) -->
        <div id="fcEmptyState" class="hidden relative w-full h-full min-h-[320px] sm:min-h-[360px] rounded-[10px] border border-hairline bg-canvas p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div class="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-2xl font-mono">
            ✓
          </div>
          <div>
            <h3 class="text-lg sm:text-xl font-bold text-ink font-sans">ĐÃ MASTER TOÀN BỘ UNIT!</h3>
            <p class="text-xs sm:text-sm text-mute mt-1.5 font-sans max-w-xs leading-relaxed">
              Tất cả từ vựng trong danh sách này đều đã được đánh dấu thuộc.
            </p>
          </div>
          <button onclick="playTapSound(); toggleFilterIncomplete()" class="py-2.5 px-4 rounded-[6px] bg-primary text-primary-on text-xs sm:text-sm font-semibold font-mono tracking-wider tap-bounce">
            XEM LẠI TẤT CẢ TỪ
          </button>
        </div>
      </div>

      <!-- CONTROLS ROW (Spacious, ergonomic touch targets to prevent accidental taps) -->
      <div class="mt-5 sm:mt-7 flex flex-col gap-3.5 sm:gap-4">
        
        <!-- Primary Audio Action (Full-width Pronounce) -->
        <div>
          <button onclick="playTapSound(); speakCurrentWord()" id="fcAudioBtn" class="w-full py-3 px-4 rounded-[8px] bg-primary hover:bg-primary-soft text-primary-on font-semibold text-xs sm:text-sm min-h-[48px] flex items-center justify-center gap-2 transition-all tap-bounce font-mono uppercase tracking-wider">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path></svg>
            <span id="fcAudioBtnText">PRONOUNCE (US/UK)</span>
            <div id="fcAudioWave" class="hidden items-center gap-0.5 ml-1">
              <span class="soundwave-bar w-0.5 bg-primary-on"></span>
              <span class="soundwave-bar w-0.5 bg-primary-on"></span>
              <span class="soundwave-bar w-0.5 bg-primary-on"></span>
              <span class="soundwave-bar w-0.5 bg-primary-on"></span>
            </div>
          </button>
        </div>

        <!-- Navigation Row (generous 14px-16px gap, 48px touch targets to eliminate mis-clicks) -->
        <div class="grid grid-cols-3 gap-3.5 sm:gap-4 font-mono text-xs sm:text-sm">
          <button onclick="playTapSound(); prevCard()" class="flex items-center justify-center gap-1.5 py-3 px-3 sm:px-4 rounded-[8px] bg-canvas hover:bg-canvas-soft border border-hairline text-ink font-semibold min-h-[48px] transition-all tap-bounce">
            <span>&lt; PREV</span>
          </button>
          
          <button onclick="toggleFlipCard()" class="flex items-center justify-center gap-1.5 py-3 px-3 sm:px-4 rounded-[8px] bg-canvas hover:bg-canvas-soft border-2 border-primary text-primary font-bold min-h-[48px] transition-all tap-bounce">
            <span>FLIP</span>
          </button>

          <button onclick="playTapSound(); nextCard()" class="flex items-center justify-center gap-1.5 py-3 px-3 sm:px-4 rounded-[8px] bg-canvas hover:bg-canvas-soft border border-hairline text-ink font-semibold min-h-[48px] transition-all tap-bounce">
            <span>NEXT &gt;</span>
          </button>
        </div>

        <!-- Status & Auxiliary Actions -->
        <div class="flex items-center justify-between gap-2.5 sm:gap-3 text-xs sm:text-sm font-mono">
          <button onclick="toggleLearnedCurrent()" id="fcToggleLearnedAction" class="flex-1 py-3 px-3 rounded-[8px] bg-canvas hover:bg-canvas-soft border border-hairline text-ink min-h-[46px] flex items-center justify-center gap-2 transition-all tap-bounce font-mono">
            <span id="fcActionLearnedIcon" class="text-primary font-bold">○</span>
            <span id="fcActionLearnedText">MARK MASTERED</span>
          </button>
          
          <button onclick="playTapSound(); toggleFilterIncomplete()" id="btnFilterIncomplete" class="py-3 px-3.5 rounded-[8px] bg-canvas hover:bg-canvas-soft border border-hairline text-body min-h-[46px] flex items-center justify-center gap-1.5 transition-all tap-bounce font-mono" title="Lọc từ chưa thuộc">
            <span id="filterIncompleteIcon">○</span>
            <span id="filterIncompleteText">Incomplete</span>
          </button>

          <button onclick="playTapSound(); toggleShuffle()" id="btnShuffle" class="py-3 px-3.5 rounded-[8px] bg-canvas hover:bg-canvas-soft border border-hairline text-body min-h-[46px] flex items-center justify-center gap-1.5 transition-all tap-bounce font-mono">
            <span>SHUFFLE</span>
          </button>
        </div>

      </div>

    </section>

    <!-- TAB 2: QUIZ / TEST (Voltagent Engineering Quiz) -->
    <section id="tab-quiz" class="hidden flex-col flex-1 w-full justify-start space-y-4">
      <div id="quizIntro" class="bg-canvas rounded-[8px] p-6 border border-hairline text-center space-y-4 my-auto">
        <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] bg-canvas-soft border border-hairline text-primary font-mono text-xs">
          <span>⚡</span> VOLTAGENT_QUIZ_ENGINE
        </div>
        <div>
          <h2 class="text-2xl font-normal text-ink-strong tracking-tight">Vocabulary Evaluation</h2>
          <p class="text-xs text-body mt-1">
            4-choice algorithmic multiple choice testing with real-time accuracy telemetry.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 text-left font-mono">
          <div class="bg-canvas-soft p-2.5 rounded-[6px] border border-hairline">
            <label class="text-[10px] text-mute uppercase tracking-widest block mb-1">QUESTIONS</label>
            <select id="quizLength" onchange="playTapSound()" class="w-full bg-canvas text-ink text-xs rounded-[4px] border border-hairline p-1.5 focus:border-primary outline-none">
              <option value="10">10 Questions</option>
              <option value="20" selected>20 Questions</option>
              <option value="30">30 Questions</option>
              <option value="ALL">All Unit Words</option>
            </select>
          </div>
          <div class="bg-canvas-soft p-2.5 rounded-[6px] border border-hairline">
            <label class="text-[10px] text-mute uppercase tracking-widest block mb-1">DIRECTION</label>
            <select id="quizModeSelect" onchange="playTapSound()" class="w-full bg-canvas text-ink text-xs rounded-[4px] border border-hairline p-1.5 focus:border-primary outline-none">
              <option value="EN_TO_VI">EN ➔ VI</option>
              <option value="VI_TO_EN">VI ➔ EN</option>
              <option value="MIX" selected>Random Mix</option>
            </select>
          </div>
        </div>

        <button onclick="playTapSound(); startQuiz()" class="w-full py-2.5 rounded-[6px] bg-primary hover:bg-primary-soft text-primary-on font-semibold text-xs sm:text-sm transition-all tap-bounce font-mono uppercase tracking-wider">
          Initialize Test ➔
        </button>
      </div>

      <div id="quizActive" class="hidden flex-col gap-3 font-mono">
        <div class="flex items-center justify-between text-xs text-mute">
          <div class="flex items-center gap-2">
            <span class="text-primary font-bold" id="quizCurrentProgress">QUESTION 01/20</span>
            <span class="text-hairline">•</span>
            <span id="quizStreak" class="text-ink">STREAK: 0</span>
          </div>
          <div class="text-primary" id="quizScoreText">SCORE: 0</div>
        </div>

        <div class="w-full bg-canvas-soft h-1 rounded-none border-b border-hairline">
          <div id="quizProgressBar" class="bg-primary h-full transition-all duration-300" style="width: 5%"></div>
        </div>

        <div class="bg-canvas rounded-[8px] p-5 border border-hairline space-y-4">
          <div class="text-center font-sans">
            <span id="quizPromptType" class="text-[10px] font-mono uppercase tracking-[2.52px] text-mute px-2 py-0.5 rounded-[4px] bg-canvas-soft border border-hairline inline-block mb-1.5">
              PROMPT
            </span>
            <div class="flex items-center justify-center gap-2">
              <h3 id="quizQuestionPrompt" class="text-2xl sm:text-3xl font-medium text-ink-strong tracking-tight">
                Unparalleled
              </h3>
              <button onclick="playTapSound(); speakQuizWord()" id="quizAudioBtn" class="text-primary p-1.5 rounded-[4px] bg-canvas-soft border border-hairline hover:bg-canvas transition-all tap-bounce" title="Pronounce">
                <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"></path></svg>
              </button>
            </div>
          </div>

          <div id="quizOptionsContainer" class="grid grid-cols-1 gap-3 sm:gap-3.5 pt-1 font-sans">
          </div>
        </div>

        <div id="quizFeedbackControls" class="flex items-center justify-end font-mono">
          <button id="quizNextBtn" onclick="playTapSound(); nextQuizQuestion()" class="hidden px-4 py-2 rounded-[6px] bg-primary text-primary-on font-semibold text-xs transition-all tap-bounce">
            NEXT QUESTION ➔
          </button>
        </div>
      </div>

      <div id="quizResult" class="hidden bg-canvas rounded-[8px] p-6 border border-hairline text-center space-y-4 my-auto font-mono">
        <div class="text-primary text-3xl font-mono">⚡</div>
        <div>
          <h2 class="text-xl font-normal text-ink-strong tracking-tight">Evaluation Completed</h2>
          <p id="quizResultSubtitle" class="text-body text-xs mt-1">Accuracy Telemetry Report</p>
        </div>

        <div class="p-4 rounded-[6px] bg-canvas-soft border border-hairline max-w-xs mx-auto">
          <div id="quizFinalScore" class="text-3xl font-bold text-primary">18 / 20</div>
          <div id="quizFinalPercentage" class="text-xs text-ink mt-1 font-mono">ACCURACY: 90%</div>
        </div>

        <div class="grid grid-cols-2 gap-2 max-w-sm mx-auto text-xs">
          <button onclick="playTapSound(); startQuiz()" class="py-2 px-3 rounded-[6px] bg-primary text-primary-on font-semibold transition-all tap-bounce">
            RETRY TEST
          </button>
          <button onclick="playTapSound(); switchTab('flashcards')" class="py-2 px-3 rounded-[6px] bg-canvas-soft hover:bg-canvas border border-hairline text-ink transition-all tap-bounce">
            FLASHCARDS
          </button>
        </div>
      </div>
    </section>

    <!-- TAB 3: DICTIONARY / ALL WORDS (Voltagent ex-data-table-cell style) -->
    <section id="tab-list" class="hidden flex flex-col flex-1 w-full font-mono min-h-0 h-full overflow-hidden">
      <!-- FIXED FILTER CARD -->
      <div id="dictFilterCard" class="flex-shrink-0 bg-canvas p-3.5 rounded-[8px] border border-hairline space-y-2 mb-3">
        <div class="relative font-sans">
          <input type="text" id="dictSearchInput" oninput="onSearchInput(this.value)" placeholder="Search English term or Vietnamese definition..." class="w-full bg-canvas-soft text-ink placeholder-mute text-xs sm:text-sm rounded-[6px] border border-hairline pl-8 pr-3 py-2 focus:outline-none focus:border-primary transition-all font-mono">
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-mute">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-1.5 text-xs">
          <div class="flex items-center gap-1 overflow-x-auto pb-0.5 max-w-full">
            <button onclick="playTapSound(); setPosFilter('ALL')" class="pos-filter-btn px-2 py-0.5 rounded-[4px] bg-primary text-primary-on font-semibold text-[11px]" data-pos="ALL">ALL</button>
            <button onclick="playTapSound(); setPosFilter('n')" class="pos-filter-btn px-2 py-0.5 rounded-[4px] bg-canvas-soft text-body text-[11px] hover:text-ink border border-hairline" data-pos="n">noun</button>
            <button onclick="playTapSound(); setPosFilter('v')" class="pos-filter-btn px-2 py-0.5 rounded-[4px] bg-canvas-soft text-body text-[11px] hover:text-ink border border-hairline" data-pos="v">verb</button>
            <button onclick="playTapSound(); setPosFilter('adj')" class="pos-filter-btn px-2 py-0.5 rounded-[4px] bg-canvas-soft text-body text-[11px] hover:text-ink border border-hairline" data-pos="adj">adj</button>
            <button onclick="playTapSound(); setPosFilter('adv')" class="pos-filter-btn px-2 py-0.5 rounded-[4px] bg-canvas-soft text-body text-[11px] hover:text-ink border border-hairline" data-pos="adv">adv</button>
          </div>

          <div class="flex items-center gap-0.5 bg-canvas-soft p-0.5 rounded-[4px] border border-hairline">
            <button onclick="playTapSound(); setStatusFilter('ALL')" id="filterStatusAll" class="px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-canvas text-ink">ALL</button>
            <button onclick="playTapSound(); setStatusFilter('UNLEARNED')" id="filterStatusUnlearned" class="px-2 py-0.5 rounded-[2px] text-[10px] text-mute hover:text-ink">LEARNING</button>
            <button onclick="playTapSound(); setStatusFilter('LEARNED')" id="filterStatusLearned" class="px-2 py-0.5 rounded-[2px] text-[10px] text-mute hover:text-ink">MASTERED</button>
          </div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-mute pt-1 border-t border-hairline/60">
          <span id="dictResultCount">51 ITEMS FOUND</span>
          <span id="dictUnitIndicator" class="text-primary truncate max-w-[180px]">Unit 1: Growing Up</span>
        </div>
      </div>

      <!-- SCROLLABLE WORD LIST -->
      <div id="dictListContainer" class="flex-1 overflow-y-auto space-y-2 pr-1 pb-4 font-sans min-h-0">
      </div>
    </section>

    <!-- TAB 4: METRICS & SETTINGS -->
    <section id="tab-stats" class="hidden flex-col flex-1 w-full space-y-4 font-mono">
      <div class="bg-canvas rounded-[8px] p-5 border border-hairline">
        <div class="text-[10px] text-mute uppercase tracking-[2.52px] mb-1">SYSTEM METRICS</div>
        <h2 class="text-lg font-normal text-ink-strong tracking-tight font-sans">Mastery Telemetry</h2>
        <p class="text-xs text-body mb-4 font-sans">Real-time status synced with SQLite backend.</p>
        
        <div class="grid grid-cols-3 gap-2 mb-4">
          <div class="bg-canvas-soft p-2.5 rounded-[6px] border border-hairline text-center">
            <div class="text-[9px] text-mute uppercase tracking-widest">MASTERED</div>
            <div id="statsLearnedCount" class="text-xl font-bold text-primary mt-0.5">0</div>
            <div class="text-[9px] text-mute">TERMS</div>
          </div>
          <div class="bg-canvas-soft p-2.5 rounded-[6px] border border-hairline text-center">
            <div class="text-[9px] text-mute uppercase tracking-widest">PENDING</div>
            <div id="statsRemainingCount" class="text-xl font-bold text-ink mt-0.5">1265</div>
            <div class="text-[9px] text-mute">TERMS</div>
          </div>
          <div class="bg-canvas-soft p-2.5 rounded-[6px] border border-hairline text-center">
            <div class="text-[9px] text-mute uppercase tracking-widest">RATE</div>
            <div id="statsPercentage" class="text-xl font-bold text-primary mt-0.5">0%</div>
            <div class="text-[9px] text-mute">TOTAL</div>
          </div>
        </div>

        <div class="w-full bg-canvas-soft h-1 rounded-none border-b border-hairline">
          <div id="statsTotalProgressBar" class="bg-primary h-full transition-all duration-500" style="width: 0%"></div>
        </div>
      </div>

      <div class="bg-canvas rounded-[8px] p-4 border border-hairline space-y-2.5">
        <h3 class="text-xs font-mono uppercase tracking-widest text-mute">UNIT BREAKDOWN</h3>
        <div id="statsUnitList" class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
        </div>
      </div>

      <div class="bg-canvas rounded-[8px] p-4 border border-hairline space-y-3 font-sans">
        <h3 class="text-xs font-mono uppercase tracking-widest text-mute">ENGINE CONFIGURATION</h3>
        
        <div class="space-y-3">
          <div>
            <div class="flex items-center justify-between text-xs text-ink mb-1 font-mono">
              <span>SPEECH_VELOCITY</span>
              <span id="speechRateDisplay" class="font-bold text-primary">0.9x</span>
            </div>
            <input type="range" id="speechRateRange" min="0.6" max="1.3" step="0.1" value="0.9" onchange="playTapSound(); updateSpeechRate(this.value)" class="w-full accent-primary cursor-pointer">
          </div>

          <div class="pt-2 border-t border-hairline flex items-center justify-between font-mono">
            <div>
              <p class="text-xs text-rose-400 font-semibold">PURGE_PROGRESS</p>
              <p class="text-[10px] text-mute">Reset all learned markers on SQLite database.</p>
            </div>
            <button onclick="playTapSound(); resetAllProgress()" class="px-2.5 py-1.5 rounded-[6px] bg-canvas-soft hover:bg-canvas text-rose-400 border border-hairline text-[11px] transition-all tap-bounce">
              RESET DB
            </button>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- MOBILE BOTTOM NAVIGATION (Hairline border, 101010 dark canvas, Inter + Mono) -->
  <div class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-canvas/95 backdrop-blur-md border-t border-hairline px-4 py-2 flex items-center justify-around font-mono">
    <button onclick="playTapSound(); switchTab('flashcards')" id="mob-flashcards" class="flex flex-col items-center justify-center gap-1 text-primary py-1.5 px-3.5 rounded-[6px] min-h-[46px] transition-all tap-bounce">
      <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      <span class="text-[9px] font-semibold tracking-wider">CARDS</span>
    </button>
    <button onclick="playTapSound(); switchTab('quiz')" id="mob-quiz" class="flex flex-col items-center justify-center gap-1 text-mute py-1.5 px-3.5 rounded-[6px] min-h-[46px] transition-all tap-bounce">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span class="text-[9px] font-semibold tracking-wider">QUIZ</span>
    </button>
    <button onclick="playTapSound(); switchTab('list')" id="mob-list" class="flex flex-col items-center justify-center gap-1 text-mute py-1.5 px-3.5 rounded-[6px] min-h-[46px] transition-all tap-bounce">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
      <span class="text-[9px] font-semibold tracking-wider">DICT</span>
    </button>
    <button onclick="playTapSound(); switchTab('stats')" id="mob-stats" class="flex flex-col items-center justify-center gap-1 text-mute py-1.5 px-3.5 rounded-[6px] min-h-[46px] transition-all tap-bounce">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
      <span class="text-[9px] font-semibold tracking-wider">METRICS</span>
    </button>
  </div>

  <!-- SCRIPT DATA & CORE APPLICATION LOGIC -->
  <script>
    const RAW_WORDS = __EMBEDDED_DATA__;

    // SYNTHESIZED SOUND EFFECTS (Engineered tactile feedback)
    let audioCtx = null;
    let isSoundMuted = localStorage.getItem('ielts_sound_muted') === 'true';

    function getAudioContext() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }

    function playTapSound() {
      if (isSoundMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.035);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
        if (navigator.vibrate) navigator.vibrate(8);
      } catch (e) {}
    }

    function playFlipSound() {
      if (isSoundMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.06);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.065);
        if (navigator.vibrate) navigator.vibrate(12);
      } catch (e) {}
    }

    function playChimeSound() {
      if (isSoundMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        [587.33, 880.00].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.12, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.23);
        });
        if (navigator.vibrate) navigator.vibrate([15, 30, 20]);
      } catch (e) {}
    }

    function playCorrectSound() {
      if (isSoundMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.1, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.26);
        });
      } catch (e) {}
    }

    function playErrorSound() {
      if (isSoundMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.16);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.17);
      } catch (e) {}
    }

    function toggleSoundMute() {
      isSoundMuted = !isSoundMuted;
      localStorage.setItem('ielts_sound_muted', isSoundMuted);
      updateMuteIcon();
      if (!isSoundMuted) playChimeSound();
    }

    function updateMuteIcon() {
      const icon = document.getElementById('soundMuteIcon');
      if (icon) icon.textContent = isSoundMuted ? '🔕' : '🔔';
    }

    // WORD TYPE BADGE COLOR PALETTE HELPERS
    function getWordTypeBadgeClass(typeStr) {
      const t = (typeStr || '').trim().toLowerCase();
      if (t === 'n' || t.startsWith('noun')) return 'badge-pos-noun';
      if (t === 'v' || t.startsWith('verb')) return 'badge-pos-verb';
      if (t === 'adj' || t.startsWith('adj')) return 'badge-pos-adj';
      if (t === 'adv' || t.startsWith('adv')) return 'badge-pos-adv';
      if (t === 'phrase' || t === 'phr' || t.startsWith('phras')) return 'badge-pos-phrase';
      if (t === 'idiom') return 'badge-pos-idiom';
      return 'badge-pos-default';
    }

    function getWordTypeLabel(typeStr) {
      const t = (typeStr || '').trim().toLowerCase();
      if (t === 'n') return 'noun';
      if (t === 'v') return 'verb';
      if (t === 'adj') return 'adj';
      if (t === 'adv') return 'adv';
      return typeStr || 'vocab';
    }

    // APPLICATION STATE
    let allWords = [...RAW_WORDS];
    let unitsList = [];
    let currentUnit = "Unit 1: Growing Up";
    let filteredWords = [];
    let currentIndex = 0;
    let isFlipped = false;
    let isShuffled = false;
    let filterOnlyIncomplete = false;
    let isAnimatingCard = false;
    let isTouchSwiping = false;
    let activeTab = 'flashcards';
    let autoSpeakTimer = null;
    let hasSpokenCurrentCard = false;
    let hasUnlockedAudio = false;

    let learnedWords = new Set();

    function isWordLearned(wordStr) {
      if (!wordStr) return false;
      return learnedWords.has(wordStr) || learnedWords.has(wordStr.trim());
    }

    function markWordLearned(wordStr) {
      if (!wordStr) return;
      learnedWords.add(wordStr);
    }

    function unmarkWordLearned(wordStr) {
      if (!wordStr) return;
      learnedWords.delete(wordStr);
      learnedWords.delete(wordStr.trim());
    }
    let authToken = localStorage.getItem('ielts_auth_token') || null;
    let currentUsername = null;
    let syncDebounceTimer = null;
    let toastTimeout = null;

    let speechRate = parseFloat(localStorage.getItem('ielts_speech_rate')) || 0.9;

    let quizQuestions = [];
    let currentQuizIndex = 0;
    let quizScore = 0;
    let quizStreak = 0;
    let quizAnswered = false;

    let dictSearch = "";
    let dictPos = "ALL";
    let dictStatus = "ALL";

    // FLOATING TOAST NOTIFICATION (chỉ hiển thị khi có lỗi)
    function showToast(msg, isError = false) {
      if (!isError) return;
      const toast = document.getElementById('syncToast');
      const text = document.getElementById('syncToastText');
      if (!toast || !text) return;

      text.textContent = msg;
      const badge = toast.firstElementChild;
      const dot = toast.querySelector('span');
      if (badge && dot) {
        dot.className = "w-2 h-2 rounded-full bg-red-500 animate-pulse";
        badge.className = "px-3.5 py-1.5 rounded-[6px] bg-[#1a1111] border border-red-500/80 text-red-200 text-xs font-mono font-medium flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.8)]";
      }

      toast.classList.remove('opacity-0', '-translate-y-3');
      toast.classList.add('opacity-100', 'translate-y-0');

      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', '-translate-y-3');
      }, 3000);
    }

    // AUTHENTICATION SYSTEM
    let authMode = "login";

    function openAuthModal(mode = "login") {
      setAuthMode(mode);
      document.getElementById('authErrorBox').classList.add('hidden');
      document.getElementById('authModal').classList.remove('hidden');
    }

    function closeAuthModal() {
      document.getElementById('authModal').classList.add('hidden');
    }

    function openForgotPassModal() {
      closeAuthModal();
      document.getElementById('forgotPassModal').classList.remove('hidden');
    }

    function closeForgotPassModal() {
      document.getElementById('forgotPassModal').classList.add('hidden');
    }

    function setAuthMode(mode) {
      authMode = mode;
      const tabLogin = document.getElementById('tabAuthLogin');
      const tabReg = document.getElementById('tabAuthRegister');
      const title = document.getElementById('authModalTitle');
      const btn = document.getElementById('authSubmitBtn');

      if (mode === 'login') {
        tabLogin.className = "py-1.5 rounded-[4px] bg-primary text-primary-on font-semibold transition-all";
        tabReg.className = "py-1.5 rounded-[4px] text-body hover:text-ink transition-all";
        title.textContent = "Sign in to workspace";
        btn.textContent = "Sign In ➔";
      } else {
        tabReg.className = "py-1.5 rounded-[4px] bg-primary text-primary-on font-semibold transition-all";
        tabLogin.className = "py-1.5 rounded-[4px] text-body hover:text-ink transition-all";
        title.textContent = "Create user credential";
        btn.textContent = "Register & Launch ➔";
      }
      document.getElementById('authErrorBox').classList.add('hidden');
    }

    async function handleAuthSubmit(e) {
      e.preventDefault();
      const u = document.getElementById('authUsername').value.trim();
      const p = document.getElementById('authPassword').value.trim();
      const errBox = document.getElementById('authErrorBox');
      const submitBtn = document.getElementById('authSubmitBtn');

      errBox.classList.add('hidden');
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-70');

      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();

        if (data.success && data.token) {
          authToken = data.token;
          currentUsername = data.username;
          localStorage.setItem('ielts_auth_token', authToken);

          playChimeSound();
          closeAuthModal();
          updateAuthUI();

          if (data.progress) {
            applyLoadedProgress(data.progress);
          }
          showToast(`AUTH_SUCCESS: @${currentUsername}`);
        } else {
          errBox.textContent = data.error || "Authentication failed.";
          errBox.classList.remove('hidden');
          playErrorSound();
        }
      } catch (err) {
        errBox.textContent = "Server unreachable. Check connection.";
        errBox.classList.remove('hidden');
        playErrorSound();
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-70');
      }
    }

    function continueAsGuest() {
      closeAuthModal();
    }

    function toggleUserMenu() {
      const menu = document.getElementById('userDropdownMenu');
      if (menu) menu.classList.toggle('hidden');
    }

    document.addEventListener('click', (e) => {
      const menu = document.getElementById('userDropdownMenu');
      const userBtn = document.getElementById('userProfileHeader');
      if (menu && !menu.classList.contains('hidden')) {
        if (!userBtn.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.add('hidden');
        }
      }
    });

    function logoutUser() {
      if (confirm("Disconnect session and log out?")) {
        authToken = null;
        currentUsername = null;
        localStorage.removeItem('ielts_auth_token');
        document.getElementById('userDropdownMenu').classList.add('hidden');
        updateAuthUI();
        playTapSound();
        showToast("DISCONNECTED");
        openAuthModal('login');
      }
    }

    function updateAuthUI() {
      const btnLogin = document.getElementById('btnLoginHeader');
      const profile = document.getElementById('userProfileHeader');
      const headerUser = document.getElementById('headerUsername');
      const menuUser = document.getElementById('menuUsername');

      if (authToken && currentUsername) {
        btnLogin.classList.add('hidden');
        profile.classList.remove('hidden');
        profile.classList.add('flex');
        headerUser.textContent = currentUsername;
        if (menuUser) menuUser.textContent = currentUsername;
      } else {
        btnLogin.classList.remove('hidden');
        profile.classList.add('hidden');
        profile.classList.remove('flex');
      }
    }

    async function checkAuthAndLoadProgress() {
      if (!authToken) {
        setTimeout(() => openAuthModal('login'), 400);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await res.json();

        if (data.success && data.username) {
          currentUsername = data.username;
          updateAuthUI();
          if (data.progress) {
            applyLoadedProgress(data.progress);
          }
          showToast(`RESUMED: @${currentUsername}`);
        } else {
          authToken = null;
          localStorage.removeItem('ielts_auth_token');
          updateAuthUI();
          setTimeout(() => openAuthModal('login'), 400);
        }
      } catch (e) {
        console.warn("Could not fetch user profile", e);
      }
    }

    function applyLoadedProgress(p) {
      if (p.current_unit) {
        currentUnit = p.current_unit;
        const sel = document.getElementById('unitSelect');
        if (sel) sel.value = currentUnit;
      }

      if (p.learned_words && Array.isArray(p.learned_words)) {
        learnedWords = new Set(p.learned_words);
      }

      filterWordsForCurrentUnit();

      if (typeof p.current_index === 'number' && p.current_index >= 0 && p.current_index < filteredWords.length) {
        currentIndex = p.current_index;
      } else {
        currentIndex = 0;
      }

      renderCurrentCard();
      updateHeaderStats();
      renderStatsTab();
      renderDictionaryList();
    }

    function triggerDatabaseSync() {
      try {
        localStorage.setItem('ielts_learned_words', JSON.stringify(Array.from(learnedWords)));
      } catch (e) {}

      if (!authToken) return;

      if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
      syncDebounceTimer = setTimeout(async () => {
        try {
          const res = await fetch('/api/progress', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              current_unit: currentUnit,
              current_index: currentIndex,
              learned_words: Array.from(learnedWords),
              quiz_stats: {}
            })
          });
          const data = await res.json();
          if (!data.success) {
            showToast(data.error || "Lỗi đồng bộ dữ liệu", true);
          }
        } catch (err) {
          showToast("Mất kết nối máy chủ khi đồng bộ", true);
        }
      }, 500);
    }

    // INITIALIZATION
    function init() {
      const unitMap = new Map();
      allWords.forEach(w => {
        if (!unitMap.has(w.library)) unitMap.set(w.library, 0);
        unitMap.set(w.library, unitMap.get(w.library) + 1);
      });
      unitsList = Array.from(unitMap.keys());

      unitsList.sort((a, b) => {
        const getNum = str => {
          const m = str.match(/Unit\\s+(\\d+)/i);
          return m ? parseInt(m[1]) : 999;
        };
        return getNum(a) - getNum(b);
      });

      const sel = document.getElementById('unitSelect');
      sel.innerHTML = '';
      
      const allOpt = document.createElement('option');
      allOpt.value = "ALL";
      allOpt.textContent = `All Units (1,265 words)`;
      sel.appendChild(allOpt);

      unitsList.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u;
        opt.textContent = `${u} (${unitMap.get(u)})`;
        if (u === currentUnit) opt.selected = true;
        sel.appendChild(opt);
      });

      document.getElementById('speechRateRange').value = speechRate;
      document.getElementById('speechRateDisplay').textContent = `${speechRate}x`;
      updateMuteIcon();

      try {
        const localLearned = JSON.parse(localStorage.getItem('ielts_learned_words') || '[]');
        if (Array.isArray(localLearned)) {
          localLearned.forEach(w => markWordLearned(w));
        }
      } catch (e) {}

      filterWordsForCurrentUnit();
      updateHeaderStats();
      renderStatsTab();
      setupKeyListeners();
      setupTouchSwipe();

      checkAuthAndLoadProgress();
    }

    function onUnitChange(val) {
      currentUnit = val;
      currentIndex = 0;
      isFlipped = false;
      filterWordsForCurrentUnit();
      updateHeaderStats();
      triggerDatabaseSync();
    }

    function filterWordsForCurrentUnit() {
      const base = currentUnit === "ALL" ? [...allWords] : allWords.filter(w => w.library === currentUnit);
      if (filterOnlyIncomplete) {
        filteredWords = base.filter(w => !isWordLearned(w.word));
      } else {
        filteredWords = [...base];
      }

      if (isShuffled) {
        shuffleArray(filteredWords);
      }

      if (currentIndex >= filteredWords.length) {
        currentIndex = 0;
      }

      renderCurrentCard(true);
      renderDictionaryList(true);
      updateFlashcardTitle();
      updateFilterIncompleteUI();
    }

    function toggleFilterIncomplete() {
      filterOnlyIncomplete = !filterOnlyIncomplete;
      currentIndex = 0;
      isFlipped = false;
      const inner = document.getElementById('flashcardInner');
      if (inner) inner.classList.remove('rotate-y-180');
      filterWordsForCurrentUnit();
    }

    function updateFilterIncompleteUI() {
      const btn = document.getElementById('btnFilterIncomplete');
      const icon = document.getElementById('filterIncompleteIcon');
      const text = document.getElementById('filterIncompleteText');
      if (!btn) return;

      const base = currentUnit === "ALL" ? allWords : allWords.filter(w => w.library === currentUnit);
      const remainingCount = base.filter(w => !isWordLearned(w.word)).length;

      if (filterOnlyIncomplete) {
        btn.className = "py-3 px-3.5 rounded-[8px] bg-primary/15 hover:bg-primary/25 border border-primary text-primary min-h-[46px] flex items-center justify-center gap-1.5 transition-all tap-bounce font-mono text-xs sm:text-sm font-semibold";
        if (icon) icon.textContent = "●";
        if (text) text.textContent = `Incomplete (${remainingCount})`;
      } else {
        btn.className = "py-3 px-3.5 rounded-[8px] bg-canvas hover:bg-canvas-soft border border-hairline text-body min-h-[46px] flex items-center justify-center gap-1.5 transition-all tap-bounce font-mono text-xs sm:text-sm";
        if (icon) icon.textContent = "○";
        if (text) text.textContent = "Incomplete";
      }
    }

    function updateFlashcardTitle() {
      const titleEl = document.getElementById('fcUnitTitle');
      titleEl.textContent = currentUnit === "ALL" ? "All 20 Units" : currentUnit;
    }

    function renderCurrentCard(resetFlip = true) {
      const emptyState = document.getElementById('fcEmptyState');
      const inner = document.getElementById('flashcardInner');
      const counterEl = document.getElementById('fcCounter');
      const progressBar = document.getElementById('fcProgressBar');

      if (!filteredWords || filteredWords.length === 0) {
        if (emptyState && inner) {
          inner.classList.add('hidden');
          emptyState.classList.remove('hidden');
        }
        if (counterEl) counterEl.textContent = '00 / 00';
        if (progressBar) progressBar.style.width = '100%';
        updateHeaderStats();
        return;
      }

      if (emptyState && inner) {
        inner.classList.remove('hidden');
        emptyState.classList.add('hidden');
      }

      const word = filteredWords[currentIndex];
      if (!word) return;

      const isLearned = isWordLearned(word.word);

      if (resetFlip) {
        isFlipped = false;
        inner.classList.remove('rotate-y-180');
      } else {
        if (isFlipped) inner.classList.add('rotate-y-180');
        else inner.classList.remove('rotate-y-180');
      }

      // Word & Type Front
      const wordText = word.word || '';
      const fcWordEl = document.getElementById('fcWord');
      fcWordEl.textContent = wordText;
      const wLen = wordText.length;
      if (wLen <= 8) {
        fcWordEl.className = "text-4xl sm:text-6xl md:text-7xl font-bold text-ink-strong tracking-[-0.8px] leading-tight font-sans break-words max-w-full";
      } else if (wLen <= 13) {
        fcWordEl.className = "text-3xl sm:text-5xl md:text-6xl font-bold text-ink-strong tracking-[-0.6px] leading-tight font-sans break-words max-w-full";
      } else if (wLen <= 20) {
        fcWordEl.className = "text-2xl sm:text-3xl md:text-5xl font-bold text-ink-strong tracking-[-0.4px] leading-snug font-sans break-words max-w-full";
      } else {
        fcWordEl.className = "text-xl sm:text-2xl md:text-3xl font-bold text-ink-strong tracking-normal leading-snug font-sans break-words max-w-full";
      }

      const frontType = document.getElementById('fcFrontType');
      if (frontType) {
        const typeClass = getWordTypeBadgeClass(word.type);
        frontType.textContent = getWordTypeLabel(word.type);
        frontType.className = `px-2.5 py-1 rounded-[4px] text-xs sm:text-sm font-mono font-medium uppercase tracking-wider border ${typeClass}`;
      }

      // Front Indicator Badge
      const frontIndBox = document.getElementById('fcFrontLearnedIndicator');
      const frontIndIcon = document.getElementById('fcFrontLearnedIcon');
      const frontIndLabel = document.getElementById('fcFrontLearnedLabel');
      if (frontIndBox && frontIndIcon && frontIndLabel) {
        if (isLearned) {
          frontIndBox.className = "flex items-center gap-1.5 text-xs sm:text-sm font-mono px-2.5 py-1 rounded-[4px] bg-canvas-soft text-primary border border-primary/50";
          frontIndIcon.textContent = "●";
          frontIndLabel.textContent = "MASTERED";
        } else {
          frontIndBox.className = "flex items-center gap-1.5 text-xs sm:text-sm font-mono px-2.5 py-1 rounded-[4px] bg-canvas-soft text-mute border border-hairline";
          frontIndIcon.textContent = "○";
          frontIndLabel.textContent = "LEARNING";
        }
      }

      // Word, Type & Meaning Back
      const fcBackWordEl = document.getElementById('fcBackWord');
      fcBackWordEl.textContent = wordText;
      if (wLen <= 14) {
        fcBackWordEl.className = "font-sans font-bold text-lg sm:text-2xl text-ink-strong truncate max-w-[180px] sm:max-w-xs";
      } else {
        fcBackWordEl.className = "font-sans font-bold text-sm sm:text-lg text-ink-strong truncate max-w-[160px] sm:max-w-xs";
      }

      const backType = document.getElementById('fcBackType');
      if (backType) {
        const typeClass = getWordTypeBadgeClass(word.type);
        backType.textContent = word.type || '';
        backType.className = `text-xs font-mono px-2 py-0.5 rounded uppercase border font-medium shrink-0 ${typeClass}`;
      }

      const meaningText = word.meaning || '';
      const fcMeaningEl = document.getElementById('fcMeaning');
      fcMeaningEl.textContent = meaningText;
      const mLen = meaningText.length;
      if (mLen <= 22) {
        fcMeaningEl.className = "text-xl sm:text-2xl md:text-3xl font-bold text-primary leading-snug font-sans";
      } else if (mLen <= 40) {
        fcMeaningEl.className = "text-lg sm:text-xl md:text-2xl font-semibold text-primary leading-snug font-sans";
      } else {
        fcMeaningEl.className = "text-base sm:text-lg md:text-xl font-medium text-primary leading-snug font-sans";
      }

      // Back Indicator Badge
      const backIndBox = document.getElementById('fcBackLearnedIndicator');
      const backIndIcon = document.getElementById('fcBackLearnedIcon');
      const backIndLabel = document.getElementById('fcBackLearnedLabel');
      if (backIndBox && backIndIcon && backIndLabel) {
        if (isLearned) {
          backIndBox.className = "flex items-center gap-1.5 text-xs sm:text-sm font-mono px-2.5 py-1 rounded-[4px] bg-canvas-soft text-primary border border-primary/50 shrink-0";
          backIndIcon.textContent = "●";
          backIndLabel.textContent = "MASTERED";
        } else {
          backIndBox.className = "flex items-center gap-1.5 text-xs sm:text-sm font-mono px-2.5 py-1 rounded-[4px] bg-canvas-soft text-mute border border-hairline shrink-0";
          backIndIcon.textContent = "○";
          backIndLabel.textContent = "LEARNING";
        }
      }

      // Example Container
      const exContainer = document.getElementById('fcExampleContainer');
      const exText = document.getElementById('fcExample');
      const exampleContent = (word.example && word.example.trim()) || '';
      const eLen = exampleContent.length;

      if (eLen <= 70) {
        exText.className = "text-sm sm:text-base text-body leading-relaxed font-sans font-normal line-clamp-3";
      } else if (eLen <= 105) {
        exText.className = "text-xs sm:text-sm md:text-base text-body leading-snug sm:leading-relaxed font-sans font-normal line-clamp-3";
      } else {
        exText.className = "text-[11px] sm:text-xs md:text-sm text-body leading-normal font-sans font-normal line-clamp-3";
      }

      if (exampleContent.length > 0) {
        exContainer.classList.remove('hidden');
        try {
          const regex = new RegExp(`\\\\b(${word.word})\\\\b`, 'gi');
          exText.innerHTML = exampleContent.replace(regex, '<span class="text-primary font-semibold underline decoration-primary/40">$1</span>');
        } catch(e) {
          exText.textContent = exampleContent;
        }
      } else {
        exContainer.classList.remove('hidden');
        exText.innerHTML = '<span class="text-mute italic font-mono">// No example context attached.</span>';
      }

      const copyBtn = document.getElementById('fcCopyExampleBtn');
      const speakBtn = document.getElementById('fcSpeakExampleBtn');
      if (copyBtn) {
        if (exampleContent.length > 0) copyBtn.classList.remove('hidden');
        else copyBtn.classList.add('hidden');
      }
      if (speakBtn) {
        if (exampleContent.length > 0) speakBtn.classList.remove('hidden');
        else speakBtn.classList.add('hidden');
      }

      // Counter & Progress Bar
      const formattedIdx = String(currentIndex + 1).padStart(2, '0');
      const formattedTotal = String(filteredWords.length).padStart(2, '0');
      if (counterEl) counterEl.textContent = `${formattedIdx} / ${formattedTotal}`;
      const pct = Math.round(((currentIndex + 1) / filteredWords.length) * 100);
      if (progressBar) progressBar.style.width = `${pct}%`;

      // Action Button
      const actionIcon = document.getElementById('fcActionLearnedIcon');
      const actionText = document.getElementById('fcActionLearnedText');
      const actionBtn = document.getElementById('fcToggleLearnedAction');
      if (actionIcon && actionText && actionBtn) {
        if (isLearned) {
          actionIcon.textContent = "●";
          actionText.textContent = "MASTERED (REVOKE)";
          actionBtn.className = "flex-1 py-3 px-3 rounded-[8px] bg-canvas-soft border border-primary text-primary min-h-[46px] flex items-center justify-center gap-2 transition-all tap-bounce font-mono font-semibold";
        } else {
          actionIcon.textContent = "○";
          actionText.textContent = "MARK MASTERED";
          actionBtn.className = "flex-1 py-3 px-3 rounded-[8px] bg-canvas hover:bg-canvas-soft border border-hairline text-ink min-h-[46px] flex items-center justify-center gap-2 transition-all tap-bounce font-mono";
        }
      }

      if (resetFlip) {
        hasSpokenCurrentCard = false;
        autoSpeakCurrentWord();
      }
    }

    function animateCardTransition(direction, onCardChange) {
      const wrapper = document.getElementById('flashcardWrapper');
      if (!wrapper) {
        if (onCardChange) onCardChange();
        renderCurrentCard(true);
        return;
      }

      isAnimatingCard = true;
      const outClass = direction === 'left' ? 'slide-out-left' : 'slide-out-right';
      const inClass = direction === 'left' ? 'slide-in-right' : 'slide-in-left';

      wrapper.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
      wrapper.classList.add(outClass);

      setTimeout(() => {
        if (onCardChange) onCardChange();
        renderCurrentCard(true);
        wrapper.classList.remove(outClass);
        wrapper.classList.add(inClass);

        setTimeout(() => {
          wrapper.classList.remove(inClass);
          isAnimatingCard = false;
        }, 220);
      }, 140);
    }

    function toggleFlipCard() {
      if (isTouchSwiping || isAnimatingCard) return;
      if (!filteredWords || filteredWords.length === 0) return;
      isFlipped = !isFlipped;
      playFlipSound();
      const inner = document.getElementById('flashcardInner');
      if (isFlipped) {
        inner.classList.add('rotate-y-180');
        autoSpeakCurrentExample();
      } else {
        inner.classList.remove('rotate-y-180');
        try { window.speechSynthesis.cancel(); } catch (e) {}
      }
    }

    function nextCard() {
      if (isAnimatingCard || !filteredWords || filteredWords.length === 0) return;

      animateCardTransition('left', () => {
        if (filterOnlyIncomplete) {
          const curWord = filteredWords[currentIndex]?.word;
          const base = currentUnit === "ALL" ? [...allWords] : allWords.filter(w => w.library === currentUnit);
          filteredWords = base.filter(w => !isWordLearned(w.word));
          if (filteredWords.length === 0) {
            currentIndex = 0;
            return;
          }
          const newIdx = filteredWords.findIndex(w => w.word === curWord);
          if (newIdx !== -1) {
            currentIndex = (newIdx + 1) % filteredWords.length;
          } else if (currentIndex >= filteredWords.length) {
            currentIndex = 0;
          }
        } else {
          if (currentIndex < filteredWords.length - 1) {
            currentIndex++;
          } else {
            currentIndex = 0;
          }
        }
      });

      updateFilterIncompleteUI();
      triggerDatabaseSync();
    }

    function prevCard() {
      if (isAnimatingCard || !filteredWords || filteredWords.length === 0) return;

      animateCardTransition('right', () => {
        if (filterOnlyIncomplete) {
          const curWord = filteredWords[currentIndex]?.word;
          const base = currentUnit === "ALL" ? [...allWords] : allWords.filter(w => w.library === currentUnit);
          filteredWords = base.filter(w => !isWordLearned(w.word));
          if (filteredWords.length === 0) {
            currentIndex = 0;
            return;
          }
          const newIdx = filteredWords.findIndex(w => w.word === curWord);
          if (newIdx !== -1) {
            currentIndex = (newIdx - 1 + filteredWords.length) % filteredWords.length;
          } else if (currentIndex >= filteredWords.length) {
            currentIndex = filteredWords.length - 1;
          }
        } else {
          if (currentIndex > 0) {
            currentIndex--;
          } else {
            currentIndex = filteredWords.length - 1;
          }
        }
      });

      updateFilterIncompleteUI();
      triggerDatabaseSync();
    }

    function toggleShuffle() {
      isShuffled = !isShuffled;
      const btn = document.getElementById('btnShuffle');
      if (isShuffled) {
        btn.classList.add('bg-primary', 'text-primary-on', 'border-primary');
        btn.classList.remove('bg-canvas', 'text-body');
        shuffleArray(filteredWords);
      } else {
        btn.classList.remove('bg-primary', 'text-primary-on', 'border-primary');
        btn.classList.add('bg-canvas', 'text-body');
        filterWordsForCurrentUnit();
      }
      currentIndex = 0;
      renderCurrentCard(true);
    }

    function toggleLearnedCurrent() {
      if (!filteredWords || filteredWords.length === 0) return;
      const word = filteredWords[currentIndex];
      if (!word) return;

      const alreadyLearned = isWordLearned(word.word);
      if (alreadyLearned) {
        unmarkWordLearned(word.word);
        playTapSound();
      } else {
        markWordLearned(word.word);
        playChimeSound();
        if (typeof confetti === 'function') {
          try {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          } catch(e) {}
        }
      }

      // Keep current side (front/back) without resetting flip!
      renderCurrentCard(false);
      updateHeaderStats();
      renderStatsTab();
      renderDictionaryList();
      updateFilterIncompleteUI();
      triggerDatabaseSync();
    }

    function speakText(text, onEndCallback) {
      if (!('speechSynthesis' in window)) return;
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();
      } catch (e) {}

      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = speechRate;

      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => (v.lang === 'en-US' || v.lang === 'en-GB') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
      if (engVoice) u.voice = engVoice;

      const wave = document.getElementById('fcAudioWave');
      if (wave) {
        wave.classList.remove('hidden');
        wave.classList.add('flex');
      }

      u.onend = () => {
        if (wave) {
          wave.classList.remove('flex');
          wave.classList.add('hidden');
        }
        if (onEndCallback) onEndCallback();
      };
      u.onerror = () => {
        if (wave) {
          wave.classList.remove('flex');
          wave.classList.add('hidden');
        }
        if (onEndCallback) onEndCallback();
      };

      try {
        window.speechSynthesis.speak(u);
      } catch (e) {}
    }

    function speakCurrentWord() {
      const word = filteredWords[currentIndex];
      if (word && word.word) {
        hasSpokenCurrentCard = true;
        speakText(word.word);
      }
    }

    function autoSpeakCurrentWord() {
      if (activeTab !== 'flashcards' || isSoundMuted) return;
      if (!filteredWords || filteredWords.length === 0) return;
      const word = filteredWords[currentIndex];
      if (!word || !word.word) return;

      if (autoSpeakTimer) clearTimeout(autoSpeakTimer);
      autoSpeakTimer = setTimeout(() => {
        if (activeTab === 'flashcards' && !isSoundMuted && filteredWords[currentIndex] === word) {
          hasSpokenCurrentCard = true;
          speakText(word.word);
        }
      }, 80);
    }

    function speakExampleSentence(e) {
      if (e) {
        e.stopPropagation();
        playTapSound();
      }
      const word = filteredWords[currentIndex];
      if (word && word.example) {
        const btn = document.getElementById('fcSpeakExampleBtn');
        if (btn) {
          btn.classList.add('text-primary');
        }
        speakText(word.example, () => {
          if (btn) btn.classList.remove('text-primary');
        });
      }
    }

    let autoSpeakExampleTimer = null;
    function autoSpeakCurrentExample() {
      if (activeTab !== 'flashcards' || isSoundMuted) return;
      if (!filteredWords || filteredWords.length === 0) return;
      const word = filteredWords[currentIndex];
      if (!word || !word.example || !word.example.trim()) return;

      if (autoSpeakExampleTimer) clearTimeout(autoSpeakExampleTimer);
      autoSpeakExampleTimer = setTimeout(() => {
        if (activeTab === 'flashcards' && isFlipped && !isSoundMuted && filteredWords[currentIndex] === word) {
          speakExampleSentence();
        }
      }, 150);
    }

    function copyExampleText(e) {
      if (e) {
        e.stopPropagation();
      }
      playTapSound();

      const word = filteredWords[currentIndex];
      const textToCopy = (word && word.example) ? word.example.trim() : '';
      if (!textToCopy) return;

      const copyBtn = document.getElementById('fcCopyExampleBtn');
      const originalSvg = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>';
      const checkSvg = '<svg class="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';

      const onCopied = () => {
        if (copyBtn) {
          copyBtn.innerHTML = checkSvg;
          setTimeout(() => {
            if (copyBtn) copyBtn.innerHTML = originalSvg;
          }, 1500);
        }
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(onCopied).catch(() => fallbackCopy(textToCopy, onCopied));
      } else {
        fallbackCopy(textToCopy, onCopied);
      }
    }

    function fallbackCopy(text, cb) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        if (cb) cb();
      } catch (err) {}
    }

    function updateSpeechRate(val) {
      speechRate = parseFloat(val);
      localStorage.setItem('ielts_speech_rate', speechRate);
      document.getElementById('speechRateDisplay').textContent = `${speechRate}x`;
    }

    function switchTab(tabId) {
      activeTab = tabId;
      if (tabId === 'list') {
        document.body.classList.add('dictionary-mode');
      } else {
        document.body.classList.remove('dictionary-mode');
      }

      ['flashcards', 'quiz', 'list', 'stats'].forEach(t => {
        document.getElementById(`tab-${t}`).classList.add('hidden');
        
        const navBtn = document.getElementById(`nav-${t}`);
        if (navBtn) {
          if (t === tabId) {
            navBtn.className = "px-3 py-1 rounded-[4px] transition-all bg-primary text-primary-on font-semibold";
          } else {
            navBtn.className = "px-3 py-1 rounded-[4px] transition-all text-body hover:text-ink";
          }
        }

        const mobBtn = document.getElementById(`mob-${t}`);
        if (mobBtn) {
          if (t === tabId) {
            mobBtn.className = "flex flex-col items-center gap-0.5 text-primary py-1 px-3 rounded-[4px] transition-all tap-bounce";
          } else {
            mobBtn.className = "flex flex-col items-center gap-0.5 text-mute py-1 px-3 rounded-[4px] transition-all tap-bounce";
          }
        }
      });

      document.getElementById(`tab-${tabId}`).classList.remove('hidden');

      if (tabId === 'flashcards') {
        autoSpeakCurrentWord();
      } else if (tabId === 'list') {
        renderDictionaryList();
      } else if (tabId === 'stats') {
        renderStatsTab();
      }
    }

    function startQuiz() {
      const lengthChoice = document.getElementById('quizLength').value;
      const modeChoice = document.getElementById('quizModeSelect').value;

      let pool = currentUnit === "ALL" ? [...allWords] : allWords.filter(w => w.library === currentUnit);
      if (pool.length < 4) pool = [...allWords];
      shuffleArray(pool);

      let count = lengthChoice === "ALL" ? pool.length : parseInt(lengthChoice);
      count = Math.min(count, pool.length);

      quizQuestions = [];
      for (let i = 0; i < count; i++) {
        const target = pool[i];
        let isEnToVi = true;
        if (modeChoice === 'VI_TO_EN') isEnToVi = false;
        else if (modeChoice === 'MIX') isEnToVi = Math.random() > 0.5;

        const distractors = [];
        const otherWords = allWords.filter(w => w.word !== target.word);
        shuffleArray(otherWords);
        for (let j = 0; j < 3; j++) distractors.push(otherWords[j]);

        const options = [
          { text: isEnToVi ? target.meaning : target.word, isCorrect: true },
          { text: isEnToVi ? distractors[0].meaning : distractors[0].word, isCorrect: false },
          { text: isEnToVi ? distractors[1].meaning : distractors[1].word, isCorrect: false },
          { text: isEnToVi ? distractors[2].meaning : distractors[2].word, isCorrect: false }
        ];
        shuffleArray(options);

        quizQuestions.push({
          target: target,
          isEnToVi: isEnToVi,
          prompt: isEnToVi ? target.word : target.meaning,
          options: options
        });
      }

      currentQuizIndex = 0;
      quizScore = 0;
      quizStreak = 0;

      document.getElementById('quizIntro').classList.add('hidden');
      document.getElementById('quizResult').classList.add('hidden');
      document.getElementById('quizActive').classList.remove('hidden');

      renderQuizQuestion();
    }

    function renderQuizQuestion() {
      quizAnswered = false;
      const q = quizQuestions[currentQuizIndex];

      const formattedIdx = String(currentQuizIndex + 1).padStart(2, '0');
      const formattedTotal = String(quizQuestions.length).padStart(2, '0');
      document.getElementById('quizCurrentProgress').textContent = `QUESTION ${formattedIdx}/${formattedTotal}`;
      document.getElementById('quizStreak').textContent = `STREAK: ${quizStreak}`;
      document.getElementById('quizScoreText').textContent = `SCORE: ${quizScore}`;
      
      const pct = Math.round(((currentQuizIndex) / quizQuestions.length) * 100);
      document.getElementById('quizProgressBar').style.width = `${pct}%`;

      document.getElementById('quizPromptType').textContent = q.isEnToVi ? "TERM" : "DEFINITION";
      document.getElementById('quizQuestionPrompt').textContent = q.prompt;

      const audioBtn = document.getElementById('quizAudioBtn');
      if (q.isEnToVi) audioBtn.classList.remove('hidden');
      else audioBtn.classList.add('hidden');

      const optContainer = document.getElementById('quizOptionsContainer');
      optContainer.innerHTML = '';

      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = "w-full text-left p-3.5 sm:p-4 rounded-[8px] min-h-[48px] bg-canvas-soft hover:bg-canvas border border-hairline text-ink font-medium text-xs sm:text-sm flex items-center justify-between gap-3 active:scale-[0.98] transition-all tap-bounce";
        btn.innerHTML = `
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-[4px] bg-canvas border border-hairline text-mute flex items-center justify-center text-[10px] font-mono">
              ${['A', 'B', 'C', 'D'][idx]}
            </span>
            <span>${opt.text}</span>
          </div>
          <span class="opt-status-icon text-xs font-mono"></span>
        `;
        btn.onclick = () => handleQuizAnswer(opt, btn, q);
        optContainer.appendChild(btn);
      });

      document.getElementById('quizNextBtn').classList.add('hidden');
    }

    function handleQuizAnswer(selectedOpt, btnEl, question) {
      if (quizAnswered) return;
      quizAnswered = true;

      const optContainer = document.getElementById('quizOptionsContainer');
      const buttons = optContainer.querySelectorAll('button');

      if (selectedOpt.isCorrect) {
        quizScore++;
        quizStreak++;
        playCorrectSound();
        btnEl.classList.remove('bg-canvas-soft');
        btnEl.classList.add('bg-canvas-soft', 'border-primary', 'text-primary');
        btnEl.querySelector('.opt-status-icon').textContent = '[OK]';
        learnedWords.add(question.target.word);
        triggerDatabaseSync();
      } else {
        quizStreak = 0;
        playErrorSound();
        btnEl.classList.remove('bg-canvas-soft');
        btnEl.classList.add('bg-canvas-soft', 'border-rose-500', 'text-rose-400');
        btnEl.querySelector('.opt-status-icon').textContent = '[FAIL]';

        buttons.forEach((b, i) => {
          if (question.options[i].isCorrect) {
            b.classList.add('border-primary', 'text-primary');
            b.querySelector('.opt-status-icon').textContent = '[CORRECT]';
          }
        });
      }

      document.getElementById('quizStreak').textContent = `STREAK: ${quizStreak}`;
      document.getElementById('quizScoreText').textContent = `SCORE: ${quizScore}`;
      updateHeaderStats();

      const nextBtn = document.getElementById('quizNextBtn');
      nextBtn.classList.remove('hidden');

      setTimeout(() => {
        if (quizAnswered && currentQuizIndex < quizQuestions.length - 1) {
          nextQuizQuestion();
        } else if (quizAnswered && currentQuizIndex === quizQuestions.length - 1) {
          finishQuiz();
        }
      }, 1200);
    }

    function nextQuizQuestion() {
      if (currentQuizIndex < quizQuestions.length - 1) {
        currentQuizIndex++;
        renderQuizQuestion();
      } else {
        finishQuiz();
      }
    }

    function finishQuiz() {
      document.getElementById('quizActive').classList.add('hidden');
      document.getElementById('quizResult').classList.remove('hidden');

      const pct = Math.round((quizScore / quizQuestions.length) * 100);
      document.getElementById('quizFinalScore').textContent = `${quizScore} / ${quizQuestions.length}`;
      document.getElementById('quizFinalPercentage').textContent = `ACCURACY: ${pct}%`;

      if (pct >= 80) {
        playChimeSound();
        if (typeof confetti === 'function') confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    }

    function speakQuizWord() {
      const q = quizQuestions[currentQuizIndex];
      if (q && q.target) speakText(q.target.word);
    }

    function onSearchInput(val) {
      dictSearch = val.trim().toLowerCase();
      renderDictionaryList(true);
    }

    function setPosFilter(pos) {
      dictPos = pos;
      document.querySelectorAll('.pos-filter-btn').forEach(btn => {
        const btnPos = btn.getAttribute('data-pos');
        if (btnPos === pos) {
          if (pos === 'ALL') {
            btn.className = "pos-filter-btn px-2 py-0.5 rounded-[4px] bg-primary text-primary-on font-semibold text-[11px]";
          } else {
            const badgeClass = getWordTypeBadgeClass(pos);
            btn.className = `pos-filter-btn px-2 py-0.5 rounded-[4px] font-semibold text-[11px] border ${badgeClass}`;
          }
        } else {
          btn.className = "pos-filter-btn px-2 py-0.5 rounded-[4px] bg-canvas-soft text-body text-[11px] hover:text-ink border border-hairline";
        }
      });
      renderDictionaryList(true);
    }

    function setStatusFilter(status) {
      dictStatus = status;
      const allBtn = document.getElementById('filterStatusAll');
      const unBtn = document.getElementById('filterStatusUnlearned');
      const lrnBtn = document.getElementById('filterStatusLearned');

      [allBtn, unBtn, lrnBtn].forEach(b => {
        b.className = "px-2 py-0.5 rounded-[2px] text-[10px] text-mute hover:text-ink";
      });

      if (status === 'ALL') allBtn.className = "px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-canvas text-ink";
      else if (status === 'UNLEARNED') unBtn.className = "px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-canvas text-ink";
      else if (status === 'LEARNED') lrnBtn.className = "px-2 py-0.5 rounded-[2px] text-[10px] font-bold bg-canvas text-ink";

      renderDictionaryList(true);
    }

    function renderDictionaryList(resetScroll = false) {
      const container = document.getElementById('dictListContainer');
      if (!container) return;

      if (resetScroll) {
        container.scrollTop = 0;
      }

      let list = currentUnit === "ALL" ? [...allWords] : allWords.filter(w => w.library === currentUnit);

      if (dictSearch) {
        list = list.filter(w => 
          w.word.toLowerCase().includes(dictSearch) || 
          w.meaning.toLowerCase().includes(dictSearch)
        );
      }

      if (dictPos !== 'ALL') {
        list = list.filter(w => w.type && w.type.toLowerCase().startsWith(dictPos.toLowerCase()));
      }

      if (dictStatus === 'LEARNED') {
        list = list.filter(w => learnedWords.has(w.word));
      } else if (dictStatus === 'UNLEARNED') {
        list = list.filter(w => !learnedWords.has(w.word));
      }

      document.getElementById('dictResultCount').textContent = `${list.length} ITEMS FOUND`;
      document.getElementById('dictUnitIndicator').textContent = currentUnit === "ALL" ? "ALL UNITS" : currentUnit;

      if (list.length === 0) {
        container.innerHTML = `
          <div class="text-center py-8 bg-canvas rounded-[8px] border border-hairline text-mute font-mono">
            <p class="text-xs">// NO_MATCHING_RECORDS_FOUND</p>
          </div>
        `;
        return;
      }

      container.innerHTML = list.map((w) => {
        const isLearned = learnedWords.has(w.word);
        const typeClass = getWordTypeBadgeClass(w.type);
        return `
          <div class="bg-canvas p-3 rounded-[6px] border border-hairline flex items-start justify-between gap-2.5 hover:border-hairline-soft transition-all">
            <div class="flex-1 space-y-0.5">
              <div class="flex items-center gap-1.5 font-mono">
                <span class="font-sans font-medium text-sm text-ink-strong">${w.word}</span>
                <span class="text-[9px] px-1.5 py-0.2 rounded border uppercase font-mono font-medium ${typeClass}">${w.type || 'vocab'}</span>
                <button onclick="playTapSound(); speakText('${w.word.replace(/'/g, "\\\\'")}')" class="text-primary hover:text-primary-soft p-1 rounded hover:bg-canvas-soft tap-bounce" title="Pronounce">
                  <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"></path></svg>
                </button>
              </div>
              <p class="text-xs font-semibold text-primary font-sans">${w.meaning}</p>
              ${w.example ? `<p class="text-[11px] text-body italic line-clamp-2 font-sans">${w.example}</p>` : ''}
            </div>

            <button onclick="toggleLearnedDictWord('${w.word.replace(/'/g, "\\\\'")}')" class="p-2 rounded-[4px] transition-all tap-bounce font-mono text-[11px] ${isLearned ? 'bg-canvas-soft text-primary border border-primary' : 'bg-canvas-soft text-mute border border-hairline hover:text-ink'}" title="${isLearned ? 'Mastered' : 'Mark Mastered'}">
              ${isLearned ? '●' : '○'}
            </button>
          </div>
        `;
      }).join('');
    }

    function toggleLearnedDictWord(wordStr) {
      if (isWordLearned(wordStr)) {
        unmarkWordLearned(wordStr);
        playTapSound();
      } else {
        markWordLearned(wordStr);
        playChimeSound();
      }
      renderDictionaryList(false);
      renderCurrentCard(false);
      updateHeaderStats();
      renderStatsTab();
      updateFilterIncompleteUI();
      triggerDatabaseSync();
    }

    function updateHeaderStats() {
      const count = learnedWords.size;
      const total = allWords.length;
      const pct = Math.round((count / total) * 100);
    }

    function renderStatsTab() {
      const count = learnedWords.size;
      const total = allWords.length;
      const remaining = total - count;
      const pct = Math.round((count / total) * 100);

      document.getElementById('statsLearnedCount').textContent = count;
      document.getElementById('statsRemainingCount').textContent = remaining;
      document.getElementById('statsPercentage').textContent = `${pct}%`;
      document.getElementById('statsTotalProgressBar').style.width = `${pct}%`;

      const listEl = document.getElementById('statsUnitList');
      if (!listEl) return;

      listEl.innerHTML = unitsList.map(u => {
        const wordsInUnit = allWords.filter(w => w.library === u);
        const learnedInUnit = wordsInUnit.filter(w => learnedWords.has(w.word)).length;
        const uPct = Math.round((learnedInUnit / wordsInUnit.length) * 100);

        return `
          <div class="bg-canvas-soft p-2.5 rounded-[4px] border border-hairline flex flex-col gap-1">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-ink truncate max-w-[220px] font-sans">${u}</span>
              <span class="text-primary">${learnedInUnit} / ${wordsInUnit.length} (${uPct}%)</span>
            </div>
            <div class="w-full bg-canvas h-1 rounded-none border-b border-hairline">
              <div class="bg-primary h-full transition-all duration-300" style="width: ${uPct}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    function resetAllProgress() {
      if (confirm("Reset and purge all progress data from SQLite?")) {
        learnedWords.clear();
        playChimeSound();
        renderCurrentCard();
        updateHeaderStats();
        renderStatsTab();
        renderDictionaryList();
        triggerDatabaseSync();
        showToast("PROGRESS_PURGED");
      }
    }

    function setupKeyListeners() {
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

        if (e.code === 'Space') {
          e.preventDefault();
          toggleFlipCard();
        } else if (e.code === 'ArrowRight') {
          e.preventDefault();
          playTapSound();
          nextCard();
        } else if (e.code === 'ArrowLeft') {
          e.preventDefault();
          playTapSound();
          prevCard();
        } else if (e.code === 'KeyS' || e.code === 'ArrowUp') {
          e.preventDefault();
          playTapSound();
          speakCurrentWord();
        } else if (e.code === 'KeyM') {
          e.preventDefault();
          toggleLearnedCurrent();
        }
      });
    }

    function setupTouchSwipe() {
      let touchStartX = 0;
      let touchStartY = 0;
      const card = document.getElementById('flashcardWrapper');
      if (!card) return;

      card.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
        isTouchSwiping = false;
      }, { passive: true });

      card.addEventListener('touchmove', (e) => {
        const curX = e.changedTouches[0].clientX;
        const curY = e.changedTouches[0].clientY;
        const diffX = curX - touchStartX;
        const diffY = curY - touchStartY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 20) {
          isTouchSwiping = true;
        }
      }, { passive: true });

      card.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const threshold = 40;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
          isTouchSwiping = true;
          playTapSound();
          if (diffX < 0) {
            nextCard();
          } else {
            prevCard();
          }
          setTimeout(() => { isTouchSwiping = false; }, 320);
        } else {
          setTimeout(() => { isTouchSwiping = false; }, 80);
        }
      }, { passive: true });
    }

    function shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    // Prevent double-click / double-tap zoom across mobile browsers
    document.addEventListener('dblclick', function(e) {
      e.preventDefault();
    }, { passive: false });

    // Pre-cache voices when speech synthesis is ready
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        try { window.speechSynthesis.getVoices(); } catch (e) {}
      };
    }

    // Unblock mobile autoplay restrictions on the user's very first interaction
    function unlockAudioOnFirstInteraction() {
      if (hasUnlockedAudio) return;
      hasUnlockedAudio = true;
      if (activeTab === 'flashcards' && !hasSpokenCurrentCard && !isSoundMuted) {
        autoSpeakCurrentWord();
      }
      window.removeEventListener('pointerdown', unlockAudioOnFirstInteraction);
      window.removeEventListener('keydown', unlockAudioOnFirstInteraction);
    }
    window.addEventListener('pointerdown', unlockAudioOnFirstInteraction, { passive: true });
    window.addEventListener('keydown', unlockAudioOnFirstInteraction, { passive: true });

    document.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>"""

full_html = html_template.replace('__EMBEDDED_DATA__', json_str)

output_path = r'D:\Vocab_Web\ielts-app\index.html'
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(full_html)

print(f"Generated {output_path} successfully! Size: {os.path.getsize(output_path)} bytes.")
