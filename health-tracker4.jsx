import { useState, useEffect } from "react";

// localStorage polyfill for window.storage (Claude artifact API replacement)
if (!window.storage) {
  window.storage = {
    get: (key) => Promise.resolve(localStorage.getItem(key) ? { value: localStorage.getItem(key) } : null),
    set: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
    delete: (key) => Promise.resolve(localStorage.removeItem(key)),
  };
}

// macOS Sequoia — system font stack renders as SF Pro on Apple devices
const SF = "-apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif";

const PATIENTS = ["Grandma", "Grandpa"];

// ── macOS Sequoia system colors ──────────────────────────────
const COLORS = {
  // Backgrounds
  bg:          "#F2F2F7",          // Apple grouped background
  card:        "#FFFFFF",          // Standard panel
  cardAlt:     "#F9F9FB",          // Secondary panel

  // Accent (system blue)
  teal:        "#007AFF",
  tealLight:   "rgba(0,122,255,0.10)",

  // Semantic aliases used throughout the app
  coral:       "#FF3B30",          // System red
  coralLight:  "rgba(255,59,48,0.08)",
  yellow:      "#FF9500",          // System orange
  yellowLight: "rgba(255,149,0,0.10)",
  navy:        "#1C1C1E",          // Primary label
  muted:       "rgba(60,60,67,0.55)", // Secondary label
  border:      "rgba(60,60,67,0.12)", // Separator

  // Status
  green:       "#34C759",
  greenLight:  "rgba(52,199,89,0.12)",
  purple:      "#AF52DE",
  purpleLight: "rgba(175,82,222,0.10)",
};

const styles = {
  app: {
    fontFamily: SF,
    background: COLORS.bg,
    minHeight: "100vh",
    color: COLORS.navy,
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  },
  // Header — translucent frosted bar
  header: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(24px) saturate(180%)",
    WebkitBackdropFilter: "blur(24px) saturate(180%)",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerTitle: {
    color: COLORS.navy,
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "-0.4px",
    margin: 0,
  },
  headerSub: {
    color: COLORS.muted,
    fontSize: "12px",
    margin: "2px 0 0 0",
    letterSpacing: "-0.1px",
  },
  patientTabs: {
    display: "flex",
    gap: "2px",
    background: "rgba(120,120,128,0.12)",
    borderRadius: "9px",
    padding: "2px",
  },
  patientTab: (active) => ({
    padding: "6px 16px",
    borderRadius: "7px",
    border: "none",
    background: active ? "#FFFFFF" : "transparent",
    color: active ? COLORS.navy : COLORS.muted,
    fontSize: "14px",
    fontWeight: active ? "600" : "400",
    cursor: "pointer",
    transition: "all 0.18s",
    fontFamily: SF,
    boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)" : "none",
  }),
  main: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "20px 16px 40px",
  },
  // Nav — segmented control style
  nav: {
    display: "flex",
    gap: "0",
    marginBottom: "20px",
    background: "rgba(120,120,128,0.12)",
    borderRadius: "11px",
    padding: "3px",
    overflow: "visible",
  },
  navBtn: (active) => ({
    flex: 1,
    padding: "9px 4px",
    border: "none",
    background: active ? "#FFFFFF" : "transparent",
    color: active ? COLORS.teal : COLORS.muted,
    fontSize: "11px",
    fontWeight: active ? "600" : "400",
    cursor: "pointer",
    transition: "all 0.18s",
    fontFamily: SF,
    borderRadius: "9px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    boxShadow: active ? "0 1px 4px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)" : "none",
    letterSpacing: "-0.1px",
  }),
  // Card — clean Apple panel
  card: {
    background: COLORS.card,
    borderRadius: "13px",
    border: "none",
    padding: "18px",
    marginBottom: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)",
  },
  sectionTitle: {
    fontSize: "17px",
    fontWeight: "600",
    color: COLORS.navy,
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    letterSpacing: "-0.3px",
  },
  // Input — Apple fill style (no border)
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "none",
    borderRadius: "9px",
    fontSize: "15px",
    fontFamily: SF,
    color: COLORS.navy,
    background: "rgba(120,120,128,0.12)",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "10px",
    transition: "background 0.15s",
    letterSpacing: "-0.1px",
  },
  row: {
    display: "flex",
    gap: "10px",
  },
  // Buttons — Apple system style
  btn: (variant = "primary") => ({
    padding: variant === "small" ? "6px 14px" : "10px 18px",
    borderRadius: "9px",
    border: "none",
    background: variant === "primary" ? COLORS.teal
              : variant === "danger"  ? COLORS.coralLight
              : "rgba(120,120,128,0.12)",
    color: variant === "primary" ? "#FFFFFF"
         : variant === "danger"  ? COLORS.coral
         : COLORS.teal,
    fontSize: variant === "small" ? "13px" : "15px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: SF,
    transition: "all 0.15s",
    whiteSpace: "nowrap",
    letterSpacing: "-0.2px",
  }),
  itemCard: (color = COLORS.tealLight) => ({
    background: color,
    borderRadius: "10px",
    padding: "12px 14px",
    marginBottom: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
  }),
  itemTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: COLORS.navy,
    marginBottom: "2px",
    letterSpacing: "-0.2px",
  },
  itemSub: {
    fontSize: "13px",
    color: COLORS.muted,
    letterSpacing: "-0.1px",
  },
  badge: (color = COLORS.teal) => ({
    display: "inline-block",
    padding: "3px 9px",
    borderRadius: "20px",
    background: color,
    color: "#fff",
    fontSize: "11px",
    fontWeight: "600",
    marginTop: "3px",
    letterSpacing: "-0.1px",
  }),
  emptyState: {
    textAlign: "center",
    padding: "32px",
    color: COLORS.muted,
    fontSize: "15px",
    letterSpacing: "-0.1px",
  },
  label: {
    fontSize: "12px",
    color: COLORS.muted,
    marginBottom: "5px",
    display: "block",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    border: "none",
    borderRadius: "9px",
    fontSize: "15px",
    fontFamily: SF,
    color: COLORS.navy,
    background: "rgba(120,120,128,0.12)",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "10px",
    resize: "vertical",
    minHeight: "80px",
    letterSpacing: "-0.1px",
  },
  statRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  stat: (color) => ({
    flex: "1",
    minWidth: "90px",
    background: color,
    borderRadius: "12px",
    padding: "14px",
    textAlign: "center",
  }),
  statNum: {
    fontSize: "28px",
    fontWeight: "700",
    color: COLORS.navy,
    lineHeight: 1,
    letterSpacing: "-0.5px",
  },
  statLabel: {
    fontSize: "11px",
    color: COLORS.muted,
    marginTop: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    fontWeight: "500",
  },
};



// ── Grandma / Grandpa custom icons (from design) ──────────────
function GrandmaIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 594 490" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M246.5 25.5625 C242.02927139 26.90454957 237.63655025 28.09633301 233.0390625 28.92578125 C228.01321091 29.89574167 223.54970402 31.57179667 218.875 33.625 C218.05878174 33.97691406 217.24256348 34.32882813 216.40161133 34.69140625 C208.44578452 38.16382614 200.67504541 41.94804535 193 46 C191.84242188 46.60199219 190.68484375 47.20398438 189.4921875 47.82421875 C147.60156817 70.58256206 111.99373609 112.33582472 96.3046875 157.3046875 C95.0845598 160.76049828 93.71750917 164.11633886 92.3125 167.5 C90.0508682 173.37736161 88.81402514 179.19020203 87.80224609 185.39697266 C87.2859628 188.47984653 86.68191388 191.52531112 86 194.57568359 C83.25080838 207.14812377 82.401499 219.19514633 82.53344727 232.04833984 C82.56255126 235.13042848 82.55396181 238.21079914 82.54101562 241.29296875 C82.55384351 253.04015274 83.39259137 264.30508823 85.59051514 275.84825134 C86.03912836 278.20561051 86.45975768 280.56716561 86.87890625 282.92993164 C88.9468146 294.41543061 92.66190342 304.95829983 97.07763672 315.74267578 C97.85380584 317.64221515 98.60381386 319.55241419 99.34765625 321.46484375 C113.58581224 357.42222073 140.49050987 390.06688088 171.8125 412.5625 C172.6051123 413.13186279 173.39772461 413.70122559 174.21435547 414.2878418 C179.93522897 418.34689325 185.69828541 421.90611231 192 425 C193.19748528 425.61419078 194.39403303 426.2302115 195.58984375 426.84765625 C199.69920271 428.95577075 203.84058581 430.99265084 208 433 C208.73202637 433.35416992 209.46405273 433.70833984 210.21826172 434.07324219 C219.92803719 438.72025927 229.3152897 442.22696738 239.82958984 444.50830078 C242.22914108 445.05191115 244.6071002 445.65828216 246.98828125 446.27734375 C247.85146973 446.50075439 248.7146582 446.72416504 249.60400391 446.9543457 C251.25682235 447.38340375 252.90891732 447.81526472 254.56005859 448.25073242 C267.10872298 451.44831609 279.24663135 452.34204891 292.125 452.25 C292.8965744 452.24689819 293.6681488 452.24379639 294.46310425 452.24060059 C311.6915738 452.15940261 327.92750766 450.68722735 344.68017578 446.55761719 C347.07021826 445.98312161 349.46776167 445.46116358 351.87109375 444.9453125 C363.52563867 442.35972801 373.95906909 438.36768431 384.67626953 433.13330078 C386.84587842 432.07516625 389.02728973 431.04771813 391.21484375 430.02734375 C411.03673428 420.63345984 428.63395649 407.65541153 444.42236328 392.51025391 C445.4516459 391.52493321 446.48626437 390.54514765 447.52685547 389.57177734 C456.46100838 381.21327112 463.84019833 371.90223073 471 362 C471.56356201 361.22551514 472.12712402 360.45103027 472.70776367 359.65307617 C477.10668272 353.50385937 480.97537724 347.14568331 484.6875 340.5625 C485.51991211 339.12293945 485.51991211 339.12293945 486.36914062 337.65429688 C489.50672944 332.11408357 492.02634127 326.66101581 494.08569336 320.63745117 C494.95958729 318.11657637 495.93320744 315.67083677 496.96484375 313.2109375 C502.4995617 299.77342707 505.71281055 286.33320177 508 272 C508.18546387 270.91122559 508.37092773 269.82245117 508.56201172 268.70068359 C510.17469267 258.25781916 510.37233018 247.91870247 510.37060547 237.36865234 C510.37496312 234.40012506 510.41137202 231.43310841 510.44921875 228.46484375 C510.52139988 216.04820898 509.23022663 204.49580327 506.51979065 192.38354492 C505.8004501 189.08494671 505.17814819 185.77025939 504.55882263 182.4516449 C502.71738356 172.84107006 499.70933039 164.03354076 496 155 C495.64550781 154.04738281 495.29101562 153.09476563 494.92578125 152.11328125 C486.54519912 130.27392038 473.15382566 110.63894502 458 93 C457.34902344 92.16855469 456.69804687 91.33710937 456.02734375 90.48046875 C453.83171798 87.79410581 451.48952699 85.41684007 449 83 C448.49001465 82.50097168 447.9800293 82.00194336 447.45458984 81.48779297 C427.87736785 62.43984056 404.70850855 45.69280255 379 36 C377.86046875 35.54753906 376.7209375 35.09507813 375.546875 34.62890625 C364.57723604 30.31636036 353.42429623 26.88971146 342 24 C340.78401123 23.67805664 340.78401123 23.67805664 339.54345703 23.34960938 C325.24980753 19.70754702 310.84600147 19.60751411 296.1875 19.5625 C295.22690674 19.55623596 294.26631348 19.54997192 293.27661133 19.54351807 C277.25844643 19.47755609 261.88513106 20.81825239 246.5 25.5625 Z " fill={color}/>
    </svg>
  );
}

function GrandpaIcon({ size = 24, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 608 528" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M246.5 25.5625 C242.02927139 26.90454957 237.63655025 28.09633301 233.0390625 28.92578125 C228.01321091 29.89574167 223.54970402 31.57179667 218.875 33.625 C218.05878174 33.97691406 217.24256348 34.32882813 216.40161133 34.69140625 C208.44578452 38.16382614 200.67504541 41.94804535 193 46 C191.84242188 46.60199219 190.68484375 47.20398438 189.4921875 47.82421875 C147.60156817 70.58256206 111.99373609 112.33582472 96.3046875 157.3046875 C95.0845598 160.76049828 93.71750917 164.11633886 92.3125 167.5 C90.0508682 173.37736161 88.81402514 179.19020203 87.80224609 185.39697266 C87.2859628 188.47984653 86.68191388 191.52531112 86 194.57568359 C83.25080838 207.14812377 82.401499 219.19514633 82.53344727 232.04833984 C82.56255126 235.13042848 82.55396181 238.21079914 82.54101562 241.29296875 C82.55384351 253.04015274 83.39259137 264.30508823 85.59051514 275.84825134 C86.03912836 278.20561051 86.45975768 280.56716561 86.87890625 282.92993164 C88.9468146 294.41543061 92.66190342 304.95829983 97.07763672 315.74267578 C97.85380584 317.64221515 98.60381386 319.55241419 99.34765625 321.46484375 C113.58581224 357.42222073 140.49050987 390.06688088 171.8125 412.5625 C172.6051123 413.13186279 173.39772461 413.70122559 174.21435547 414.2878418 C179.93522897 418.34689325 185.69828541 421.90611231 192 425 C193.19748528 425.61419078 194.39403303 426.2302115 195.58984375 426.84765625 C199.69920271 428.95577075 203.84058581 430.99265084 208 433 C208.73202637 433.35416992 209.46405273 433.70833984 210.21826172 434.07324219 C219.92803719 438.72025927 229.3152897 442.22696738 239.82958984 444.50830078 C242.22914108 445.05191115 244.6071002 445.65828216 246.98828125 446.27734375 C247.85146973 446.50075439 248.7146582 446.72416504 249.60400391 446.9543457 C251.25682235 447.38340375 252.90891732 447.81526472 254.56005859 448.25073242 C267.10872298 451.44831609 279.24663135 452.34204891 292.125 452.25 C292.8965744 452.24689819 293.6681488 452.24379639 294.46310425 452.24060059 C311.6915738 452.15940261 327.92750766 450.68722735 344.68017578 446.55761719 C347.07021826 445.98312161 349.46776167 445.46116358 351.87109375 444.9453125 C363.52563867 442.35972801 373.95906909 438.36768431 384.67626953 433.13330078 C386.84587842 432.07516625 389.02728973 431.04771813 391.21484375 430.02734375 C411.03673428 420.63345984 428.63395649 407.65541153 444.42236328 392.51025391 C445.4516459 391.52493321 446.48626437 390.54514765 447.52685547 389.57177734 C456.46100838 381.21327112 463.84019833 371.90223073 471 362 C471.56356201 361.22551514 472.12712402 360.45103027 472.70776367 359.65307617 C477.10668272 353.50385937 480.97537724 347.14568331 484.6875 340.5625 C485.51991211 339.12293945 485.51991211 339.12293945 486.36914062 337.65429688 C489.50672944 332.11408357 492.02634127 326.66101581 494.08569336 320.63745117 C494.95958729 318.11657637 495.93320744 315.67083677 496.96484375 313.2109375 C502.4995617 299.77342707 505.71281055 286.33320177 508 272 C508.18546387 270.91122559 508.37092773 269.82245117 508.56201172 268.70068359 C510.17469267 258.25781916 510.37233018 247.91870247 510.37060547 237.36865234 C510.37496312 234.40012506 510.41137202 231.43310841 510.44921875 228.46484375 C510.52139988 216.04820898 509.23022663 204.49580327 506.51979065 192.38354492 C505.8004501 189.08494671 505.17814819 185.77025939 504.55882263 182.4516449 C502.71738356 172.84107006 499.70933039 164.03354076 496 155 C495.64550781 154.04738281 495.29101562 153.09476563 494.92578125 152.11328125 C486.54519912 130.27392038 473.15382566 110.63894502 458 93 C457.34902344 92.16855469 456.69804687 91.33710937 456.02734375 90.48046875 C453.83171798 87.79410581 451.48952699 85.41684007 449 83 C448.49001465 82.50097168 447.9800293 82.00194336 447.45458984 81.48779297 C427.87736785 62.43984056 404.70850855 45.69280255 379 36 C377.86046875 35.54753906 376.7209375 35.09507813 375.546875 34.62890625 C364.57723604 30.31636036 353.42429623 26.88971146 342 24 C340.78401123 23.67805664 340.78401123 23.67805664 339.54345703 23.34960938 C325.24980753 19.70754702 310.84600147 19.60751411 296.1875 19.5625 C295.22690674 19.55623596 294.26631348 19.54997192 293.27661133 19.54351807 C277.25844643 19.47755609 261.88513106 20.81825239 246.5 25.5625 Z " fill={color}/>
    </svg>
  );
}

// ── Monochrome icon component (SF Symbols inspired) ──────────
function Icon({ name, size = 18, color = "currentColor", weight = 1.8 }) {
  const paths = {
    house:     "M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
    pill:      "M12 4.5a4.5 4.5 0 00-4.5 4.5v6a4.5 4.5 0 009 0V9A4.5 4.5 0 0012 4.5zm0 0v15M9.75 9.75h4.5",
    calendar:  "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v11.25M3 18.75A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75M3 18.75v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
    clipboard: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    clock:     "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    person:    "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
    heart:     "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
    trash:     "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0",
    pencil:    "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125",
    location:  "M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
    refresh:   "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99",
    food:      "M12 3c-4.97 0-9 3.185-9 7.115C3 14.784 6.5 19.5 12 21c5.5-1.5 9-6.216 9-10.885C21 6.185 16.97 3 12 3zm-1.5 4.5v5m3-5v5",
    check:     "M4.5 12.75l6 6 9-13.5",
    xmark:     "M6 18L18 6M6 6l12 12",
    plus:      "M12 4.5v15m7.5-7.5h-15",
    sparkles:  "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z",
    bars:      "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12",
    activity:  "M3.75 12h16.5M12 3.75v16.5",
    note:      "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125",
    stethoscope:"M3.75 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.115 5.52M3.75 9v.75c0 4.97 3.91 9.035 8.84 9.24.162.007.324.01.487.01M16.5 4.5a2.25 2.25 0 110 4.5 2.25 2.25 0 010-4.5zm0 4.5V18a2.25 2.25 0 002.25 2.25h.75",
    moon:      "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z",
    sun:       "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={weight} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d={paths[name] || paths.xmark} />
    </svg>
  );
}

const TABS = [
  { id: "dashboard",    label: "Overview",     icon: "house"     },
  { id: "medications",  label: "Medications",  icon: "pill"      },
  { id: "appointments", label: "Appointments", icon: "calendar"  },
  { id: "symptoms",     label: "Health Log",   icon: "clipboard" },
  { id: "activity",     label: "Activity",     icon: "clock"     },
  { id: "checkin",      label: "Check-in",     icon: "sparkles"  },
];

function toKey(patient, section) {
  return `healthtracker:${patient}:${section}`;
}

async function load(patient, section) {
  try {
    const r = await window.storage.get(toKey(patient, section));
    return r ? JSON.parse(r.value) : [];
  } catch {
    return [];
  }
}

async function save(patient, section, data) {
  try {
    await window.storage.set(toKey(patient, section), JSON.stringify(data));
  } catch {}
}

// ─── AUDIT LOG ────────────────────────────────────────────────
//
// Every mutation is recorded as an immutable event:
// { id, timestamp (UTC ISO), actor, patient, section, action, recordId, recordName, changes }
//
// Actions:
//   ADD    — new record; `changes` holds initial non-empty values as { to }
//   PATCH  — update; `changes` holds field-level diff as { from, to }
//   REMOVE — deletion; `changes` holds last known values as { from }
//
const AUDIT_KEY = "audit:events";

async function loadAuditEvents() {
  try {
    const r = await window.storage.get(AUDIT_KEY);
    return r ? JSON.parse(r.value) : [];
  } catch { return []; }
}

async function appendAuditEvent(event) {
  try {
    const existing = await loadAuditEvents();
    await window.storage.set(AUDIT_KEY, JSON.stringify([...existing, event]));
  } catch {}
}

function buildEvent({ actor, patient, section, action, record, patches, prevRecord }) {
  let changes = {};
  if (action === "ADD") {
    Object.entries(record).forEach(([k, v]) => {
      if (v !== "" && v !== false && !(Array.isArray(v) && v.length === 0) && k !== "id")
        changes[k] = { to: v };
    });
  } else if (action === "PATCH") {
    Object.entries(patches).forEach(([k, v]) => {
      changes[k] = { from: prevRecord[k], to: v };
    });
  } else if (action === "REMOVE") {
    Object.entries(record).forEach(([k, v]) => {
      if (k !== "id") changes[k] = { from: v };
    });
  }
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(), // UTC
    actor,
    patient,
    section,
    action,
    recordId: record.id,
    recordName: record.name || record.doctor || record.note?.slice(0, 40) || "—",
    changes,
  };
}

// Known users — add more names here as the family grows
const KNOWN_USERS = ["You", "Wife"];
const ACTOR_KEY = "app:actor";

export default function App() {
  const [patient, setPatient] = useState("Grandma");
  const [tab, setTab] = useState("dashboard");
  const [meds, setMeds] = useState([]);
  const [appts, setAppts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [actor, setActor] = useState(KNOWN_USERS[0]);

  // Load saved actor preference on mount
  useEffect(() => {
    window.storage.get(ACTOR_KEY).then(r => { if (r) setActor(r.value); }).catch(() => {});
  }, []);

  // Load data when patient changes
  useEffect(() => {
    setLoaded(false);
    Promise.all([
      load(patient, "meds"),
      load(patient, "appts"),
      load(patient, "logs"),
    ]).then(([m, a, l]) => {
      setMeds(m);
      setAppts(a);
      setLogs(l);
      setLoaded(true);
    });
  }, [patient]);

  const switchActor = (name) => {
    setActor(name);
    window.storage.set(ACTOR_KEY, name).catch(() => {});
  };

  // Each update accepts an optional pre-built audit event
  const updateMeds  = (data, event) => { setMeds(data);  save(patient, "meds",  data); if (event) appendAuditEvent(event); };
  const updateAppts = (data, event) => { setAppts(data); save(patient, "appts", data); if (event) appendAuditEvent(event); };
  const updateLogs  = (data, event) => { setLogs(data);  save(patient, "logs",  data); if (event) appendAuditEvent(event); };

  return (
    <div style={{ ...styles.app, background: "linear-gradient(160deg, #F2F2F7 0%, #EAEAF2 50%, #F2F2F7 100%)" }}>
      <header style={styles.header}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}><Icon name="heart" size={18} color={COLORS.coral} weight={1.8}/><p style={styles.headerTitle}>Family Health</p></div>
          <p style={styles.headerSub}>Managing care with love</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span style={{ color: COLORS.muted, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.3px" }}>Logged in as</span>
            {KNOWN_USERS.map(u => (
              <button key={u} onClick={() => switchActor(u)} style={{
                padding: "4px 12px", borderRadius: "12px", border: "1.5px solid",
                borderColor: "transparent",
                background: actor === u ? COLORS.teal : "rgba(120,120,128,0.12)",
                color: actor === u ? "#fff" : COLORS.muted,
                fontSize: "12px", fontWeight: actor === u ? "bold" : "normal",
                cursor: "pointer", fontFamily: SF,
              }}>{u}</button>
            ))}
          </div>
          <div style={styles.patientTabs}>
            {PATIENTS.map(p => (
              <button key={p} style={styles.patientTab(patient === p)} onClick={() => setPatient(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <nav style={styles.nav}>
          {TABS.map((t, i) => (
            <button
              key={t.id}
              style={{ ...styles.navBtn(tab === t.id), borderRight: i < TABS.length - 1 ? `1px solid ${COLORS.border}` : "none" }}
              onClick={() => setTab(t.id)}
            >
              <Icon name={t.icon} size={20} color="currentColor" weight={1.6} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {!loaded ? (
          <div style={styles.emptyState}>Loading...</div>
        ) : (
          <>
            {tab === "dashboard"    && <Dashboard patient={patient} meds={meds} appts={appts} logs={logs} setTab={setTab} actor={actor} updateMeds={updateMeds} />}
            {tab === "medications"  && <Medications meds={meds} update={updateMeds} actor={actor} patient={patient} />}
            {tab === "appointments" && <Appointments appts={appts} update={updateAppts} actor={actor} patient={patient} />}
            {tab === "symptoms"     && <SymptomLog logs={logs} update={updateLogs} actor={actor} patient={patient} />}
            {tab === "activity"     && <ActivityLog />}
            {tab === "checkin"      && <CheckIn patient={patient} />}
          </>
        )}
      </main>
    </div>
  );
}

// ─── TODAY MED LIST ──────────────────────────────────────────
function TodayMedList({ meds, patient, setTab }) {
  const todayMeds = [...meds]
    .filter(m => isTodayMed(m.schedule))
    .sort((a, b) => a.name.localeCompare(b.name));

  const [taken, setTaken] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    window.storage.get(takenKey(patient))
      .then(r => { setTaken(r ? JSON.parse(r.value) : {}); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [patient]);

  const toggleTaken = (id) => {
    const next = { ...taken, [id]: !taken[id] };
    setTaken(next);
    window.storage.set(takenKey(patient), JSON.stringify(next)).catch(() => {});
  };

  const takenCount = todayMeds.filter(m => taken[m.id]).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={styles.sectionTitle}>Today's Medications</div>
        {todayMeds.length > 0 && (
          <span style={{ fontSize: "13px", color: takenCount === todayMeds.length ? "#6BA368" : COLORS.muted, fontWeight: "bold" }}>
            {takenCount}/{todayMeds.length} taken
          </span>
        )}
      </div>

      {!loaded && <div style={styles.emptyState}>Loading...</div>}

      {loaded && todayMeds.length === 0 && (
        <div style={{ ...styles.emptyState, ...styles.card }}>
          {meds.length === 0
            ? <span>No medications added yet. <span style={{ color: COLORS.teal, cursor: "pointer", fontWeight: "bold" }} onClick={() => setTab("medications")}>Add one →</span></span>
            : "No medications scheduled for today."}
        </div>
      )}

      {loaded && todayMeds.map(m => (
        <TodayMedCard key={m.id} med={m} taken={!!taken[m.id]} onToggle={() => toggleTaken(m.id)} />
      ))}

      {/* All done banner */}
      {loaded && todayMeds.length > 0 && takenCount === todayMeds.length && (
        <div style={{ background: "#E8F5E9", border: "1px solid #A5D6A7", borderRadius: "12px", padding: "14px 18px", textAlign: "center", marginTop: "8px" }}>
          <div style={{ fontSize: "22px", marginBottom: "4px" }}>🎉</div>
          <div style={{ fontWeight: "bold", color: "#2E7D32", fontSize: "15px" }}>All done for today!</div>
          <div style={{ fontSize: "13px", color: "#4CAF50", marginTop: "2px" }}>All medications have been taken.</div>
        </div>
      )}
    </div>
  );
}

// ─── TODAY MED CARD ───────────────────────────────────────────
// Purposefully simple — designed for grandparents to use directly.
// Big tap target, clear status, no clutter.
function TodayMedCard({ med, taken, onToggle }) {
  const [hover, setHover] = useState(false);

  return (
    <div style={{
      background: taken ? "#F1F8F1" : "#fff",
      border: `1.5px solid ${taken ? "#A5D6A7" : COLORS.border}`,
      borderRadius: "14px",
      padding: "16px 18px",
      marginBottom: "10px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      transition: "all 0.2s",
      opacity: taken ? 0.75 : 1,
    }}>
      {/* Big check button */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        title={taken ? "Mark as not taken" : "Mark as taken"}
        style={{
          width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
          border: `2.5px solid ${taken ? "#6BA368" : hover ? COLORS.teal : COLORS.border}`,
          background: taken ? "#6BA368" : hover ? COLORS.tealLight : "#fff",
          color: taken ? "#fff" : hover ? COLORS.teal : COLORS.border,
          fontSize: "22px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s",
        }}
      >{taken ? "✓" : "✓"}</button>

      {/* Med info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "17px", fontWeight: "bold", color: COLORS.navy,
          textDecoration: taken ? "line-through" : "none",
        }}>
          {med.name}
          {med.brandName && <span style={{ fontSize: "13px", color: COLORS.muted, fontWeight: "normal", marginLeft: "8px" }}>({med.brandName})</span>}
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "5px", flexWrap: "wrap", alignItems: "center" }}>
          {med.dosage && <span style={{ fontSize: "13px", color: COLORS.muted }}>{med.dosage}</span>}
          {med.schedule && <span style={styles.badge(taken ? "#A5D6A7" : COLORS.teal)}>{formatSchedule(med.schedule, true)}</span>}
          {med.withFood && <span title="Take with food" style={{ fontSize: "16px" }}>🍽</span>}
        </div>
      </div>

      {/* Taken label */}
      {taken && (
        <span style={{ fontSize: "13px", color: "#6BA368", fontWeight: "bold", flexShrink: 0 }}>Taken</span>
      )}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function Dashboard({ patient, meds, appts, logs, setTab, actor, updateMeds }) {
  const upcomingAppts = appts.filter(a => new Date(a.date) >= new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));
  const recentLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 2);

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontSize: "22px", color: COLORS.navy, margin: "0 0 4px 0" }}>
          {patient}'s Health Overview
        </h2>
        <p style={{ color: COLORS.muted, margin: 0, fontSize: "14px" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div style={styles.statRow}>
        <div style={styles.stat(COLORS.tealLight)}>
          <div style={styles.statNum}>{meds.length}</div>
          <div style={styles.statLabel}>Medications</div>
        </div>
        <div style={styles.stat(COLORS.yellowLight)}>
          <div style={styles.statNum}>{upcomingAppts.length}</div>
          <div style={styles.statLabel}>Upcoming Appts</div>
        </div>
        <div style={styles.stat(COLORS.coralLight)}>
          <div style={styles.statNum}>{logs.length}</div>
          <div style={styles.statLabel}>Log Entries</div>
        </div>
      </div>

      {/* Today's Medications — filtered to today's schedule, with taken tracking */}
      <TodayMedList meds={meds} patient={patient} setTab={setTab} />

      {/* Next appointment */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>Next Appointment</div>
        {upcomingAppts.length === 0 ? (
          <div style={styles.emptyState}>
            No upcoming appointments.{" "}
            <span style={{ color: COLORS.teal, cursor: "pointer", fontWeight: "bold" }} onClick={() => setTab("appointments")}>Add one →</span>
          </div>
        ) : (
          <div style={styles.itemCard(COLORS.yellowLight)}>
            <div>
              <div style={styles.itemTitle}>{upcomingAppts[0].doctor}</div>
              <div style={styles.itemSub}>{upcomingAppts[0].specialty}</div>
              <div style={{ ...styles.itemSub, marginTop: "4px", fontWeight: "bold", color: COLORS.navy }}>
                {new Date(upcomingAppts[0].date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" })} at {upcomingAppts[0].time}
              </div>
              {upcomingAppts[0].location && <div style={styles.itemSub}>{upcomingAppts[0].location}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Recent logs */}
      <div style={styles.card}>
        <div style={styles.sectionTitle}>Recent Health Notes</div>
        {recentLogs.length === 0 ? (
          <div style={styles.emptyState}>
            No health logs yet.{" "}
            <span style={{ color: COLORS.teal, cursor: "pointer", fontWeight: "bold" }} onClick={() => setTab("symptoms")}>Add a note →</span>
          </div>
        ) : (
          recentLogs.map(l => (
            <div key={l.id} style={styles.itemCard(COLORS.coralLight)}>
              <div>
                <div style={styles.itemSub}>{new Date(l.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                <div style={{ ...styles.itemTitle, fontSize: "15px", marginTop: "2px" }}>{l.note}</div>
                {l.mood && <span style={styles.badge(COLORS.coral)}>Feeling: {l.mood}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── PHARMACY PICKER ─────────────────────────────────────────
// Two modes: "manual" (plain text) or "search" (AI-powered lookup via Anthropic API)
function PharmacyPicker({ value, onChange }) {
  const [mode, setMode] = useState(value?.pharmacyName ? "manual" : "manual");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const v = value || {};
  const set = (updates) => onChange({ ...v, ...updates });

  const runSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    setResults([]);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: `You are a pharmacy lookup assistant. The user is searching for a pharmacy. Use web search to find real pharmacies matching their query. Return ONLY a JSON array (no markdown, no explanation) of up to 4 results, each with: { name, phone, address, city, postal }. If no results found, return [].`,
          messages: [{ role: "user", content: `Find pharmacies matching: "${query}"` }],
        }),
      });
      const data = await response.json();
      const text = (Array.isArray(data.content) ? data.content : []).filter(b => b.type === "text").map(b => b.text).join("") || "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResults(Array.isArray(parsed) ? parsed : []);
      if (Array.isArray(parsed) && parsed.length === 0) setSearchError("No pharmacies found. Try a different search.");
    } catch {
      setSearchError("Search failed. Please enter details manually.");
    }
    setSearching(false);
  };

  const selectResult = (r) => {
    onChange({
      ...v,
      pharmacyName:    r.name    || "",
      pharmacyPhone:   r.phone   || "",
      pharmacyAddress: r.address || "",
      pharmacyCity:    r.city    || "",
      pharmacyPostal:  r.postal  || "",
    });
    setResults([]);
    setQuery("");
    setMode("manual");
  };

  return (
    <div style={{ marginBottom: "10px" }}>
      <label style={styles.label}>Pharmacy</label>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "0", marginBottom: "12px", background: COLORS.bg, borderRadius: "8px", border: `1px solid ${COLORS.border}`, overflow: "hidden", width: "fit-content" }}>
        {[["manual", "Manual Entry"], ["search", "Address Lookup"]].map(([m, label]) => (
          <button key={m} type="button" onClick={() => { setMode(m); setResults([]); setSearchError(""); }} style={{
            padding: "7px 16px", border: "none",
            background: mode === m ? COLORS.teal : "transparent",
            color: mode === m ? "#fff" : COLORS.muted,
            borderRadius: "7px",
            fontWeight: mode === m ? "bold" : "normal",
            fontSize: "13px", cursor: "pointer", fontFamily: SF,
            transition: "all 0.15s",
          }}>{label}</button>
        ))}
      </div>

      {/* Search mode */}
      {mode === "search" && (
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input
              style={{ ...styles.input, flex: 1, marginBottom: 0 }}
              placeholder="e.g. Shoppers Drug Mart Abbotsford BC"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && runSearch()}
            />
            <button type="button" style={{ ...styles.btn("primary"), whiteSpace: "nowrap" }} onClick={runSearch} disabled={searching}>
              {searching ? "Searching…" : "Search"}
            </button>
          </div>
          {searchError && <div style={{ fontSize: "13px", color: COLORS.coral, marginBottom: "8px" }}>{searchError}</div>}
          {results.length > 0 && (
            <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: "10px", overflow: "hidden" }}>
              {results.map((r, i) => (
                <div key={i} onClick={() => selectResult(r)} style={{
                  padding: "12px 14px", cursor: "pointer", borderBottom: i < results.length - 1 ? `1px solid ${COLORS.border}` : "none",
                  background: "#fff", transition: "background 0.1s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.tealLight}
                  onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                >
                  <div style={{ fontWeight: "bold", fontSize: "14px", color: COLORS.navy }}>{r.name}</div>
                  {r.address && <div style={{ fontSize: "13px", color: COLORS.muted, marginTop: "2px" }}>{r.address}{r.city ? `, ${r.city}` : ""}{r.postal ? ` ${r.postal}` : ""}</div>}
                  {r.phone   && <div style={{ fontSize: "13px", color: COLORS.muted }}>📞 {r.phone}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual fields — always shown, pre-filled from search selection */}
      <input style={styles.input} placeholder="Pharmacy name" value={v.pharmacyName || ""} onChange={e => set({ pharmacyName: e.target.value })} />
      <input style={styles.input} placeholder="Phone number" value={v.pharmacyPhone || ""} onChange={e => set({ pharmacyPhone: e.target.value })} />
      <input style={styles.input} placeholder="Street address" value={v.pharmacyAddress || ""} onChange={e => set({ pharmacyAddress: e.target.value })} />
      <div style={styles.row}>
        <input style={{ ...styles.input, flex: 2 }} placeholder="City" value={v.pharmacyCity || ""} onChange={e => set({ pharmacyCity: e.target.value })} />
        <input style={{ ...styles.input, flex: 1 }} placeholder="Postal code" value={v.pharmacyPostal || ""} onChange={e => set({ pharmacyPostal: e.target.value })} />
      </div>
    </div>
  );
}

// ─── MEDICATIONS ──────────────────────────────────────────────
//
// 🔧 FEATURE FLAGS — flip to `true` to show a field group in the UI
// The data is always saved regardless of these flags, so no data is ever lost.
//
const MED_FIELDS = {
  SHOW_BRAND_NAME:       true,  // Brand name (vs generic)
  SHOW_PRESCRIBE_DATE:   true,  // Date prescribed
  SHOW_REFILLS:          true,  // # of refills left + next refill date
  SHOW_PHARMACY:         true,  // Pharmacy name + phone number
  SHOW_REFILL_LOG:       true,  // Log of past refill dates
  SHOW_DATE_STARTED:     true,  // Date started + running days/years counter
};

// Full empty medication object — all fields are stored even if hidden in UI
const EMPTY_MED = {
  // ── Always visible ──────────────────────
  name:           "",
  dosage:         "",
  schedule: {
    preset:     "daily",    // "daily" | "twice_daily" | "weekly" | "monthly" | "custom"
    days:       [],          // for weekly: ["Mon","Wed"] etc.
    monthDay:   "",          // for monthly: "15"
    timesPerDay: 1,          // for custom
    intervalDays: 1,         // for custom: every N days
    startDate:  "",          // date range start
    endDate:    "",          // date range end (empty = ongoing)
    notes:      "",          // custom free text
  },
  prescriber:     "",
  withFood:       false,
  notes:          "",
  // ── Hidden until flags are flipped ──────
  brandName:      "",        // SHOW_BRAND_NAME
  datePrescribed: "",        // SHOW_PRESCRIBE_DATE
  refillsLeft:    "",        // SHOW_REFILLS
  nextRefillDate: "",        // SHOW_REFILLS
  pharmacyName:   "",        // SHOW_PHARMACY
  pharmacyPhone:  "",        // SHOW_PHARMACY
  pharmacyAddress:"",        // SHOW_PHARMACY
  pharmacyCity:   "",        // SHOW_PHARMACY
  pharmacyPostal: "",        // SHOW_PHARMACY
  refillLog:      [],        // SHOW_REFILL_LOG  — array of { date, note }
  dateStarted:    "",        // SHOW_DATE_STARTED
};


// Helper: turn a schedule object into a human-readable string
function formatSchedule(schedule, hideDates = false) {
  if (!schedule || typeof schedule === "string") return schedule || "—";
  const { preset, days, monthDay, timesPerDay, intervalDays, startDate, endDate } = schedule;
  const dateRange = (!hideDates && (startDate || endDate))
    ? ` (${startDate ? new Date(startDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "start"}–${endDate ? new Date(endDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "ongoing"})`
    : "";
  if (preset === "daily")       return `Once daily${dateRange}`;
  if (preset === "twice_daily") return `Twice daily${dateRange}`;
  if (preset === "weekly")      return days?.length ? `Weekly on ${days.join(", ")}${dateRange}` : `Once a week${dateRange}`;
  if (preset === "monthly")     return monthDay ? `Monthly on the ${monthDay}${["11","12","13"].includes(monthDay) ? "th" : monthDay.endsWith("1") ? "st" : monthDay.endsWith("2") ? "nd" : monthDay.endsWith("3") ? "rd" : "th"}${dateRange}` : `Once a month${dateRange}`;
  if (preset === "custom") {
    const parts = [];
    if (timesPerDay > 1) parts.push(`${timesPerDay}x/day`);
    if (intervalDays > 1) parts.push(`every ${intervalDays} days`);
    if (schedule.notes) parts.push(schedule.notes);
    return parts.length ? parts.join(", ") + dateRange : `Custom${dateRange}`;
  }
  return "—";
}


// Helper: should this medication be taken today?
function isTodayMed(schedule) {
  if (!schedule || typeof schedule === "string") return true; // legacy string = always show
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  // Check date range
  if (schedule.startDate && todayStr < schedule.startDate) return false;
  if (schedule.endDate   && todayStr > schedule.endDate)   return false;

  const day = now.getDay(); // 0=Sun,1=Mon,...6=Sat
  const DAY_MAP = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };

  if (schedule.preset === "daily" || schedule.preset === "twice_daily") return true;

  if (schedule.preset === "weekly") {
    if (!schedule.days?.length) return day === 1; // default Monday
    return schedule.days.some(d => DAY_MAP[d] === day);
  }

  if (schedule.preset === "monthly") {
    return schedule.monthDay ? parseInt(schedule.monthDay) === now.getDate() : now.getDate() === 1;
  }

  if (schedule.preset === "custom") {
    if (!schedule.startDate) return true;
    const start  = new Date(schedule.startDate + "T12:00:00");
    const diffMs = now.setHours(12,0,0,0) - start.setHours(12,0,0,0);
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const interval = parseInt(schedule.intervalDays) || 1;
    return diffDays >= 0 && diffDays % interval === 0;
  }

  return true;
}

// Key for storing today's taken medications: "taken:PATIENT:YYYY-MM-DD"
function takenKey(patient) {
  return `taken:${patient}:${new Date().toISOString().split("T")[0]}`;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PRESET_OPTIONS = [
  { id: "daily",       label: "Daily" },
  { id: "twice_daily", label: "Twice Daily" },
  { id: "weekly",      label: "Once a Week" },
  { id: "monthly",     label: "Once a Month" },
  { id: "custom",      label: "Custom" },
];

// FrequencyPicker component
function FrequencyPicker({ value, onChange }) {
  const s = value || { preset: "daily", days: [], monthDay: "", timesPerDay: 1, intervalDays: 1, startDate: "", endDate: "", notes: "" };
  const set = (updates) => onChange({ ...s, ...updates });

  return (
    <div style={{ marginBottom: "10px" }}>
      <label style={styles.label}>Schedule</label>

      {/* Preset pills */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        {PRESET_OPTIONS.map(opt => (
          <button key={opt.id} type="button" onClick={() => set({ preset: opt.id })} style={{
            padding: "7px 16px", borderRadius: "20px", border: "2px solid",
            borderColor: s.preset === opt.id ? COLORS.teal : COLORS.border,
            background: s.preset === opt.id ? COLORS.tealLight : "#fff",
            color: s.preset === opt.id ? COLORS.teal : COLORS.muted,
            fontWeight: s.preset === opt.id ? "bold" : "normal",
            fontSize: "14px", cursor: "pointer", fontFamily: SF,
            transition: "all 0.15s",
          }}>{opt.label}</button>
        ))}
      </div>

      {/* Weekly — day picker */}
      {s.preset === "weekly" && (
        <div style={{ marginBottom: "12px" }}>
          <label style={styles.label}>Day(s) of the week</label>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {DAYS_OF_WEEK.map(day => {
              const active = s.days?.includes(day);
              return (
                <button key={day} type="button" onClick={() => set({ days: active ? (s.days || []).filter(d => d !== day) : [...(s.days || []), day] })} style={{
                  width: "44px", height: "36px", borderRadius: "8px", border: "2px solid",
                  borderColor: active ? COLORS.teal : COLORS.border,
                  background: active ? COLORS.teal : "#fff",
                  color: active ? "#fff" : COLORS.muted,
                  fontSize: "13px", fontWeight: "bold", cursor: "pointer",
                  fontFamily: SF, transition: "all 0.15s",
                }}>{day}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly — day of month */}
      {s.preset === "monthly" && (
        <div style={{ marginBottom: "12px" }}>
          <label style={styles.label}>Day of the month</label>
          <input style={{ ...styles.input, maxWidth: "100px" }} type="number" min="1" max="31"
            placeholder="e.g. 15" value={s.monthDay}
            onChange={e => set({ monthDay: e.target.value })} />
        </div>
      )}

      {/* Custom options */}
      {s.preset === "custom" && (
        <div style={{ background: COLORS.bg, borderRadius: "10px", padding: "14px", marginBottom: "12px" }}>
          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Times per day</label>
              <input style={styles.input} type="number" min="1" max="10" value={s.timesPerDay}
                onChange={e => set({ timesPerDay: parseInt(e.target.value) || 1 })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Every N days</label>
              <input style={styles.input} type="number" min="1" value={s.intervalDays}
                onChange={e => set({ intervalDays: parseInt(e.target.value) || 1 })} />
            </div>
          </div>
          <label style={styles.label}>Additional notes</label>
          <input style={styles.input} placeholder="e.g. Take in the morning" value={s.notes || ""}
            onChange={e => set({ notes: e.target.value })} />
        </div>
      )}

      {/* Date range — shown for all presets */}
      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Start date</label>
          <input style={styles.input} type="date" value={s.startDate}
            onChange={e => set({ startDate: e.target.value })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>End date <span style={{ fontWeight: "400", textTransform: "none", letterSpacing: "0" }}>(leave blank = ongoing)</span></label>
          <input style={styles.input} type="date" value={s.endDate}
            onChange={e => set({ endDate: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

// Helper: calculate how long ago a date was
function timeSince(dateStr) {
  if (!dateStr) return null;
  const start = new Date(dateStr + "T12:00:00");
  const now = new Date();
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  if (days < 0) return null;
  if (days === 0) return "Started today";
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""}`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? "s" : ""}, ${days % 30} days`;
  const years = Math.floor(days / 365);
  const rem = Math.floor((days % 365) / 30);
  return `${years} year${years !== 1 ? "s" : ""}${rem > 0 ? `, ${rem} month${rem !== 1 ? "s" : ""}` : ""}`;
}

function Medications({ meds, update, actor, patient }) {
  const [form, setForm] = useState(EMPTY_MED);
  const [adding, setAdding] = useState(false);
  const [newRefillDate, setNewRefillDate] = useState("");
  const [newRefillNote, setNewRefillNote] = useState("");

  const f = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const fCheck = (field) => (e) => setForm({ ...form, [field]: e.target.checked });

  const addRefillToLog = () => {
    if (!newRefillDate) return;
    setForm({ ...form, refillLog: [...form.refillLog, { date: newRefillDate, note: newRefillNote, id: Date.now() }] });
    setNewRefillDate("");
    setNewRefillNote("");
  };

  const removeRefillFromLog = (id) => setForm({ ...form, refillLog: (form.refillLog || []).filter(r => r.id !== id) });

  const add = () => {
    if (!form.name.trim()) return;
    const newRecord = { ...form, id: Date.now() };
    const event = buildEvent({ actor, patient, section: "meds", action: "ADD", record: newRecord });
    update([...meds, newRecord], event);
    setForm(EMPTY_MED);
    setNewRefillDate("");
    setNewRefillNote("");
    setAdding(false);
  };

  const remove = (id) => {
    const record = meds.find(m => m.id === id);
    const event = buildEvent({ actor, patient, section: "meds", action: "REMOVE", record });
    update(meds.filter(m => m.id !== id), event);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "21px", margin: 0 }}>Medications</h2>
        <button style={styles.btn("primary")} onClick={() => setAdding(!adding)}>
          {adding ? "Cancel" : "+ Add Medication"}
        </button>
      </div>

      {adding && (
        <div style={{ ...styles.card, border: `2px solid ${COLORS.teal}` }}>
          <div style={styles.sectionTitle}>New Medication</div>

          {/* ── Always visible fields ── */}
          <label style={styles.label}>Medication Name *</label>
          <input style={styles.input} placeholder="e.g. Lisinopril" value={form.name} onChange={f("name")} />

          {MED_FIELDS.SHOW_BRAND_NAME && (
            <>
              <label style={styles.label}>Brand Name</label>
              <input style={styles.input} placeholder="e.g. Zestril" value={form.brandName} onChange={f("brandName")} />
            </>
          )}

          <label style={styles.label}>Dosage</label>
          <input style={styles.input} placeholder="e.g. 10mg" value={form.dosage} onChange={f("dosage")} />

          <FrequencyPicker value={form.schedule} onChange={v => setForm({ ...form, schedule: v })} />

          <label style={styles.label}>Prescribing Doctor</label>
          <input style={styles.input} placeholder="e.g. Dr. Smith" value={form.prescriber} onChange={f("prescriber")} />

          {MED_FIELDS.SHOW_PRESCRIBE_DATE && (
            <>
              <label style={styles.label}>Date Prescribed</label>
              <input style={styles.input} type="date" value={form.datePrescribed} onChange={f("datePrescribed")} />
            </>
          )}



          {MED_FIELDS.SHOW_PHARMACY && (
            <PharmacyPicker value={form} onChange={updates => setForm({ ...form, ...updates })} />
          )}

          {MED_FIELDS.SHOW_REFILLS && (
            <>
              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Refills Left</label>
                  <input style={styles.input} type="number" min="0" placeholder="e.g. 3" value={form.refillsLeft} onChange={f("refillsLeft")} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Next Refill Date</label>
                  <input style={styles.input} type="date" value={form.nextRefillDate} onChange={f("nextRefillDate")} />
                </div>
              </div>
            </>
          )}

          {MED_FIELDS.SHOW_REFILL_LOG && (
            <>
              <label style={styles.label}>Past Refills Log</label>
              {form.refillLog.length > 0 && (
                <div style={{ marginBottom: "10px" }}>
                  {(form.refillLog || []).map(r => (
                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: COLORS.tealLight, borderRadius: "6px", marginBottom: "6px", fontSize: "13px" }}>
                      <span><strong>{new Date(r.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong>{r.note ? ` — ${r.note}` : ""}</span>
                      <button onClick={() => removeRefillFromLog(r.id)} style={{ background: "none", border: "none", color: COLORS.coral, cursor: "pointer", fontSize: "16px" }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ ...styles.row, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Add Refill Date</label>
                  <input style={styles.input} type="date" value={newRefillDate} onChange={e => setNewRefillDate(e.target.value)} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={styles.label}>Note (optional)</label>
                  <input style={styles.input} placeholder="e.g. 90-day supply" value={newRefillNote} onChange={e => setNewRefillNote(e.target.value)} />
                </div>
                <button style={{ ...styles.btn("secondary"), marginBottom: "10px", flexShrink: 0 }} onClick={addRefillToLog}>+ Add</button>
              </div>
            </>
          )}

          <label style={styles.label}>Notes</label>
          <textarea style={styles.textarea} placeholder="Side effects, special instructions..." value={form.notes} onChange={f("notes")} />

          <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", cursor: "pointer", marginBottom: "14px" }}>
            <input type="checkbox" checked={form.withFood} onChange={fCheck("withFood")} />
            Take with food
          </label>

          <button style={styles.btn("primary")} onClick={add}>Save Medication</button>
        </div>
      )}

      {meds.length === 0 && !adding ? (
        <div style={{ ...styles.emptyState, ...styles.card }}>No medications added yet. Click "Add Medication" to get started.</div>
      ) : (
        [...meds].sort((a, b) => a.name.localeCompare(b.name)).map(m => (
          <MedCard key={m.id} med={m} actor={actor} patient={patient} onPatch={(patches, prevRecord) => { const event = buildEvent({ actor, patient, section: "meds", action: "PATCH", record: prevRecord, patches, prevRecord }); update(meds.map(x => x.id === m.id ? { ...x, ...patches } : x), event); }} onRemove={() => remove(m.id)} />
        ))
      )}
    </div>
  );
}

// ─── MODAL HELPERS ───────────────────────────────────────────
function ModalSection({ title, children }) {
  const hasContent = Array.isArray(children)
    ? children.some(Boolean)
    : Boolean(children);
  if (!hasContent) return null;
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.8px", color: COLORS.muted, marginBottom: "8px" }}>{title}</div>
      <div style={{ background: "rgba(120,120,128,0.07)", borderRadius: "10px", padding: "12px 14px" }}>{children}</div>
    </div>
  );
}

function ModalRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 0", borderBottom: `1px solid ${COLORS.border}`, gap: "16px" }}>
      <span style={{ fontSize: "13px", color: COLORS.muted, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "14px", color: COLORS.navy, fontWeight: "500", textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ─── MED CARD ────────────────────────────────────────────────
//
// Modal has two modes controlled by `editing` state:
//   view  → read-only detail display
//   edit  → inline editable fields (PATCH on save)
//
function MedCard({ med, onPatch, onRemove, actor, patient }) {
  const [modalOpen, setModalOpen]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteHover, setDeleteHover]     = useState(false);
  const [cardHover, setCardHover]         = useState(false);
  const [viewActive, setViewActive]       = useState(false);
  const [editing, setEditing]             = useState(false);
  const [draft, setDraft]                 = useState({});
  const [newRefillDate, setNewRefillDate] = useState("");
  const [newRefillNote, setNewRefillNote] = useState("");

  const openView = () => { setEditing(false); setModalOpen(true); };
  const openEdit = () => { setDraft({ ...med }); setEditing(true); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(false); setDraft({}); };

  const savePatch = () => {
    const patches = {};
    Object.keys(draft).forEach(key => {
      if (JSON.stringify(draft[key]) !== JSON.stringify(med[key])) patches[key] = draft[key];
    });
    if (Object.keys(patches).length > 0) onPatch(patches, med);
    closeModal();
  };

  const d      = (field) => (e) => setDraft({ ...draft, [field]: e.target.value });
  const dCheck = (field) => (e) => setDraft({ ...draft, [field]: e.target.checked });

  const addRefillToDraft = () => {
    if (!newRefillDate) return;
    setDraft({ ...draft, refillLog: [...(draft.refillLog || []), { date: newRefillDate, note: newRefillNote, id: Date.now() }] });
    setNewRefillDate(""); setNewRefillNote("");
  };
  const removeRefillFromDraft = (id) => setDraft({ ...draft, refillLog: (draft.refillLog || []).filter(r => r.id !== id) });

  return (
    <>
      {/* ── GLANCE CARD — click anywhere to open modal ── */}
      <div
        onClick={openView}
        onMouseEnter={() => setCardHover(true)}
        onMouseLeave={() => setCardHover(false)}
        style={{
          ...styles.card,
          cursor: "pointer",
          background: cardHover ? COLORS.tealLight : COLORS.card,
          transition: "background 0.15s, box-shadow 0.15s",
          boxShadow: cardHover ? "0 4px 16px rgba(42,123,111,0.12)" : "0 1px 6px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "17px", fontWeight: "bold", color: COLORS.navy }}>
              {med.name}
              {MED_FIELDS.SHOW_BRAND_NAME && med.brandName && (
                <span style={{ fontSize: "13px", color: COLORS.muted, fontWeight: "normal", marginLeft: "8px" }}>({med.brandName})</span>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "6px", flexWrap: "wrap", alignItems: "center" }}>
              {med.schedule && <span style={styles.badge(COLORS.teal)}>{formatSchedule(med.schedule, true)}</span>}
              {MED_FIELDS.SHOW_REFILLS && med.nextRefillDate && (
                <span style={styles.badge(COLORS.yellow)}>
                  Refill {new Date(med.nextRefillDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
              {med.withFood && (
                <span title="Take with food" style={{ display:"inline-flex", alignItems:"center", opacity:0.7 }}><Icon name="food" size={15} color={COLORS.muted} weight={1.6}/></span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" }}>
            {/* View button — teal fill on active/press */}
            <button
              onClick={e => { e.stopPropagation(); openView(); }}
              onMouseDown={() => setViewActive(true)}
              onMouseUp={() => setViewActive(false)}
              onMouseLeave={() => setViewActive(false)}
              style={{
                ...styles.btn("secondary"),
                background: viewActive ? COLORS.teal : cardHover ? "#fff" : "#fff",
                color: viewActive ? "#fff" : COLORS.teal,
                borderColor: COLORS.teal,
                border: `1.5px solid ${COLORS.teal}`,
                transition: "all 0.1s",
              }}
            >View</button>
            {/* X delete button — only visible on hover, no border */}
            <button
              onMouseEnter={() => setDeleteHover(true)}
              onMouseLeave={() => setDeleteHover(false)}
              onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
              title="Remove medication"
              style={{
                width: "30px", height: "30px", borderRadius: "50%", border: "none",
                background: deleteHover ? COLORS.coralLight : "transparent",
                color: deleteHover ? COLORS.coral : "transparent",
                fontSize: "18px", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", flexShrink: 0,
              }}
            >×</button>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(false)} style={{
          position: "fixed", inset: 0, background: "rgba(30,58,95,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1100, padding: "20px",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: "16px", padding: "28px",
            maxWidth: "380px", width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)", textAlign: "center",
          }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:"12px" }}><Icon name="trash" size={36} color={COLORS.muted} weight={1.4}/></div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "19px", color: COLORS.navy }}>Remove medication?</h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: COLORS.muted, lineHeight: 1.6 }}>
              Are you sure you want to remove <strong style={{ color: COLORS.navy }}>{med.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button style={styles.btn("danger")} onClick={() => { setConfirmDelete(false); onRemove(); }}>Yes, remove</button>
              <button style={styles.btn("secondary")} onClick={() => setConfirmDelete(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL / EDIT MODAL ── */}
      {modalOpen && (
        <div onClick={closeModal} style={{
          position: "fixed", inset: 0, background: "rgba(30,58,95,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: "16px", padding: "28px",
            maxWidth: "520px", width: "100%", maxHeight: "85vh",
            overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}>

            {/* Modal header — shared by both modes */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: "0 0 2px 0", fontSize: "22px", color: COLORS.navy }}>
                  {editing ? (draft.name || med.name) : med.name}
                </h2>
                <div style={{ fontSize: "12px", color: editing ? COLORS.yellow : COLORS.muted, fontStyle: "italic" }}>
                  {editing ? "Only changed fields will be saved" : "Viewing full details"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {editing &&
                  <button style={{ ...styles.btn("secondary"), color: COLORS.muted }} onClick={() => { setEditing(false); setDraft({}); }}>← View</button>
                }
                <button onClick={closeModal} style={{
                  background: COLORS.bg, border: "none", borderRadius: "50%",
                  width: "32px", height: "32px", fontSize: "18px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>×</button>
              </div>
            </div>

            {/* ── VIEW MODE ── */}
            {!editing && (<>
              <ModalSection title="Dosage & Schedule">
                {med.dosage    && <ModalRow label="Dosage"    value={med.dosage} />}
                {med.schedule  && <ModalRow label="Schedule"  value={formatSchedule(med.schedule)} />}
                {med.schedule?.startDate && <ModalRow label="Start date" value={new Date(med.schedule.startDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />}
                {med.schedule?.endDate   && <ModalRow label="End date"   value={new Date(med.schedule.endDate   + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />}
                {med.withFood  && <ModalRow label="With food" value="Yes" />}
              </ModalSection>

              {(med.prescriber || med.datePrescribed || med.dateStarted) && (
                <ModalSection title="Prescription">
                  {med.prescriber && <ModalRow label="Prescribed by" value={med.prescriber} />}
                  {MED_FIELDS.SHOW_PRESCRIBE_DATE && med.datePrescribed && (
                    <ModalRow label="Date prescribed" value={new Date(med.datePrescribed + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
                  )}
                  {MED_FIELDS.SHOW_DATE_STARTED && med.dateStarted && (
                    <ModalRow label="Taking for" value={timeSince(med.dateStarted)} />
                  )}
                </ModalSection>
              )}

              {MED_FIELDS.SHOW_PHARMACY && (med.pharmacyName || med.pharmacyPhone || med.pharmacyAddress) && (
                <ModalSection title="Pharmacy">
                  {med.pharmacyName    && <ModalRow label="Pharmacy" value={med.pharmacyName} />}
                  {med.pharmacyPhone   && <ModalRow label="Phone"    value={med.pharmacyPhone} />}
                  {med.pharmacyAddress && <ModalRow label="Address"  value={[med.pharmacyAddress, med.pharmacyCity, med.pharmacyPostal].filter(Boolean).join(", ")} />}
                </ModalSection>
              )}

              {MED_FIELDS.SHOW_REFILLS && (med.refillsLeft !== "" || med.nextRefillDate) && (
                <ModalSection title="Refills">
                  {med.refillsLeft !== "" && <ModalRow label="Refills left"     value={med.refillsLeft} />}
                  {med.nextRefillDate     && <ModalRow label="Next refill date" value={new Date(med.nextRefillDate + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />}
                </ModalSection>
              )}

              {MED_FIELDS.SHOW_REFILL_LOG && med.refillLog?.length > 0 && (
                <ModalSection title="Refill History">
                  {(med.refillLog || []).map(r => (
                    <div key={r.id} style={{ fontSize: "14px", color: COLORS.navy, padding: "5px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                      📅 <strong>{new Date(r.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong>
                      {r.note && <span style={{ color: COLORS.muted }}> — {r.note}</span>}
                    </div>
                  ))}
                </ModalSection>
              )}

              {med.notes && (
                <ModalSection title="Notes">
                  <div style={{ fontSize: "14px", color: COLORS.navy, lineHeight: "1.6" }}>{med.notes}</div>
                </ModalSection>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", paddingTop: "16px", borderTop: `1px solid ${COLORS.border}` }}>
                <button style={styles.btn("secondary")} onClick={closeModal}>Close</button>
                <button style={styles.btn("primary")} onClick={() => { setDraft({ ...med }); setEditing(true); }}>Edit</button>
              </div>
            </>)}

            {/* ── EDIT MODE ── */}
            {editing && (<>
              <label style={styles.label}>Medication Name *</label>
              <input style={styles.input} value={draft.name} onChange={d("name")} />

              {MED_FIELDS.SHOW_BRAND_NAME && (<>
                <label style={styles.label}>Brand Name</label>
                <input style={styles.input} value={draft.brandName} onChange={d("brandName")} />
              </>)}

              <label style={styles.label}>Dosage</label>
              <input style={styles.input} value={draft.dosage} onChange={d("dosage")} />

              <FrequencyPicker value={draft.schedule} onChange={v => setDraft({ ...draft, schedule: v })} />

              <label style={styles.label}>Prescribing Doctor</label>
              <input style={styles.input} value={draft.prescriber} onChange={d("prescriber")} />

              {MED_FIELDS.SHOW_PRESCRIBE_DATE && (<>
                <label style={styles.label}>Date Prescribed</label>
                <input style={styles.input} type="date" value={draft.datePrescribed} onChange={d("datePrescribed")} />
              </>)}



              {MED_FIELDS.SHOW_PHARMACY && (
                <PharmacyPicker value={draft} onChange={updates => setDraft({ ...draft, ...updates })} />
              )}

              {MED_FIELDS.SHOW_REFILLS && (
                <div style={styles.row}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Refills Left</label>
                    <input style={styles.input} type="number" min="0" value={draft.refillsLeft} onChange={d("refillsLeft")} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Next Refill Date</label>
                    <input style={styles.input} type="date" value={draft.nextRefillDate} onChange={d("nextRefillDate")} />
                  </div>
                </div>
              )}

              {MED_FIELDS.SHOW_REFILL_LOG && (<>
                <label style={styles.label}>Past Refills Log</label>
                {draft.refillLog?.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    {(draft.refillLog || []).map(r => (
                      <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: COLORS.tealLight, borderRadius: "6px", marginBottom: "6px", fontSize: "13px" }}>
                        <span><strong>{new Date(r.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong>{r.note ? ` — ${r.note}` : ""}</span>
                        <button onClick={() => removeRefillFromDraft(r.id)} style={{ background: "none", border: "none", color: COLORS.coral, cursor: "pointer", fontSize: "16px" }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ ...styles.row, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>Add Refill Date</label>
                    <input style={styles.input} type="date" value={newRefillDate} onChange={e => setNewRefillDate(e.target.value)} />
                  </div>
                  <div style={{ flex: 2 }}>
                    <label style={styles.label}>Note (optional)</label>
                    <input style={styles.input} placeholder="e.g. 90-day supply" value={newRefillNote} onChange={e => setNewRefillNote(e.target.value)} />
                  </div>
                  <button style={{ ...styles.btn("secondary"), marginBottom: "10px", flexShrink: 0 }} onClick={addRefillToDraft}>+ Add</button>
                </div>
              </>)}

              <label style={styles.label}>Notes</label>
              <textarea style={styles.textarea} value={draft.notes} onChange={d("notes")} />

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", cursor: "pointer", marginBottom: "16px" }}>
                <input type="checkbox" checked={draft.withFood} onChange={dCheck("withFood")} />
                Take with food
              </label>

              <div style={{ display: "flex", gap: "10px", paddingTop: "16px", borderTop: `1px solid ${COLORS.border}` }}>
                <button style={styles.btn("primary")}    onClick={savePatch}>Save Changes</button>
                <button style={styles.btn("secondary")}  onClick={() => { setEditing(false); setDraft({}); }}>Cancel</button>
              </div>
            </>)}

          </div>
        </div>
      )}
    </>
  );
}

// ─── APPOINTMENTS ─────────────────────────────────────────────
function Appointments({ appts, update, actor, patient }) {
  const empty = { doctor: "", specialty: "", date: "", time: "", location: "", notes: "" };
  const [form, setForm] = useState(empty);
  const [adding, setAdding] = useState(false);

  const add = () => {
    if (!form.doctor.trim() || !form.date) return;
    const newRecord = { ...form, id: Date.now() };
    const event = buildEvent({ actor, patient, section: "appts", action: "ADD", record: newRecord });
    update([...appts, newRecord], event);
    setForm(empty);
    setAdding(false);
  };
  const remove = (id) => {
    const record = appts.find(a => a.id === id);
    const event = buildEvent({ actor, patient, section: "appts", action: "REMOVE", record });
    update(appts.filter(a => a.id !== id), event);
  };

  const sorted = [...appts].sort((a, b) => new Date(a.date) - new Date(b.date));
  const upcoming = sorted.filter(a => new Date(a.date) >= new Date(new Date().toDateString()));
  const past = sorted.filter(a => new Date(a.date) < new Date(new Date().toDateString()));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "21px", margin: 0 }}>Appointments</h2>
        <button style={styles.btn("primary")} onClick={() => setAdding(!adding)}>
          {adding ? "Cancel" : "+ Add Appointment"}
        </button>
      </div>

      {adding && (
        <div style={{ ...styles.card, border: `2px solid ${COLORS.teal}` }}>
          <div style={styles.sectionTitle}>New Appointment</div>
          <label style={styles.label}>Doctor Name *</label>
          <input style={styles.input} placeholder="e.g. Dr. Johnson" value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })} />
          <label style={styles.label}>Specialty</label>
          <input style={styles.input} placeholder="e.g. Cardiologist" value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} />
          <div style={styles.row}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Date *</label>
              <input style={styles.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Time</label>
              <input style={styles.input} type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
          </div>
          <label style={styles.label}>Location / Clinic</label>
          <input style={styles.input} placeholder="e.g. Downtown Medical Center" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <label style={styles.label}>Notes</label>
          <textarea style={styles.textarea} placeholder="Questions to ask, things to bring..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <button style={styles.btn("primary")} onClick={add}>Save Appointment</button>
        </div>
      )}

      {appts.length === 0 && !adding && (
        <div style={{ ...styles.emptyState, ...styles.card }}>No appointments yet. Click "Add Appointment" to get started.</div>
      )}

      {upcoming.length > 0 && (
        <>
          <h3 style={{ fontSize: "16px", color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px 0" }}>Upcoming</h3>
          {upcoming.map(a => <ApptCard key={a.id} a={a} onRemove={() => remove(a.id)} onPatch={(patches) => { const event = buildEvent({ actor, patient, section: "appts", action: "PATCH", record: a, patches, prevRecord: a }); update(appts.map(x => x.id === a.id ? { ...x, ...patches } : x), event); }} bg={COLORS.yellowLight} />)}
        </>
      )}
      {past.length > 0 && (
        <>
          <h3 style={{ fontSize: "16px", color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.5px", margin: "16px 0 10px 0" }}>Past</h3>
          {past.map(a => <ApptCard key={a.id} a={a} onRemove={() => remove(a.id)} onPatch={(patches) => { const event = buildEvent({ actor, patient, section: "appts", action: "PATCH", record: a, patches, prevRecord: a }); update(appts.map(x => x.id === a.id ? { ...x, ...patches } : x), event); }} bg="#F5F5F5" />)}
        </>
      )}
    </div>
  );
}

function ApptCard({ a, onRemove, onPatch, bg }) {
  const [modalOpen, setModalOpen]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteHover, setDeleteHover]     = useState(false);
  const [cardHover, setCardHover]         = useState(false);
  const [viewActive, setViewActive]       = useState(false);
  const [editing, setEditing]             = useState(false);
  const [draft, setDraft]                 = useState({});

  const openView  = () => { setEditing(false); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(false); setDraft({}); };

  const savePatch = () => {
    const patches = {};
    Object.keys(draft).forEach(key => {
      if (JSON.stringify(draft[key]) !== JSON.stringify(a[key])) patches[key] = draft[key];
    });
    if (Object.keys(patches).length > 0) onPatch(patches);
    closeModal();
  };

  const d = (field) => (e) => setDraft({ ...draft, [field]: e.target.value });

  const isPast = new Date(a.date) < new Date(new Date().toDateString());

  return (
    <>
      {/* ── GLANCE CARD ── */}
      <div
        onClick={openView}
        onMouseEnter={() => setCardHover(true)}
        onMouseLeave={() => setCardHover(false)}
        style={{
          ...styles.card,
          background: cardHover ? (isPast ? "#F0F0F0" : COLORS.yellowLight) : (bg || COLORS.card),
          cursor: "pointer",
          transition: "background 0.15s, box-shadow 0.15s",
          boxShadow: cardHover ? "0 4px 16px rgba(42,123,111,0.1)" : "0 1px 6px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "17px", fontWeight: "bold", color: COLORS.navy }}>{a.doctor}</div>
            <div style={{ display: "flex", gap: "8px", marginTop: "5px", flexWrap: "wrap", alignItems: "center" }}>
              {a.specialty && <span style={styles.badge(isPast ? COLORS.muted : COLORS.yellow)}>{a.specialty}</span>}
              <span style={{ fontSize: "13px", fontWeight: "bold", color: isPast ? COLORS.muted : COLORS.teal }}>
                {new Date(a.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                {a.time && ` · ${a.time}`}
              </span>
              {a.location && <span style={{ fontSize: "13px", color: COLORS.muted }}>{a.location}</span>}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" }}>
            <button
              onClick={e => { e.stopPropagation(); openView(); }}
              onMouseDown={() => setViewActive(true)}
              onMouseUp={() => setViewActive(false)}
              onMouseLeave={() => setViewActive(false)}
              style={{
                ...styles.btn("secondary"),
                background: viewActive ? COLORS.teal : "#fff",
                color: viewActive ? "#fff" : COLORS.teal,
                border: `1.5px solid ${COLORS.teal}`,
                transition: "all 0.1s",
              }}
            >View</button>
            <button
              onMouseEnter={() => setDeleteHover(true)}
              onMouseLeave={() => setDeleteHover(false)}
              onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
              title="Remove appointment"
              style={{
                width: "30px", height: "30px", borderRadius: "50%", border: "none",
                background: deleteHover ? COLORS.coralLight : "transparent",
                color: deleteHover ? COLORS.coral : "transparent",
                fontSize: "18px", cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", flexShrink: 0,
              }}
            >×</button>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRMATION ── */}
      {confirmDelete && (
        <div onClick={() => setConfirmDelete(false)} style={{
          position: "fixed", inset: 0, background: "rgba(30,58,95,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1100, padding: "20px",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: "16px", padding: "28px",
            maxWidth: "380px", width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)", textAlign: "center",
          }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:"12px" }}><Icon name="trash" size={36} color={COLORS.muted} weight={1.4}/></div>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "19px", color: COLORS.navy }}>Remove appointment?</h3>
            <p style={{ margin: "0 0 24px 0", fontSize: "14px", color: COLORS.muted, lineHeight: 1.6 }}>
              Are you sure you want to remove the appointment with <strong style={{ color: COLORS.navy }}>{a.doctor}</strong>? This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button style={styles.btn("danger")} onClick={() => { setConfirmDelete(false); onRemove(); }}>Yes, remove</button>
              <button style={styles.btn("secondary")} onClick={() => setConfirmDelete(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL / EDIT MODAL ── */}
      {modalOpen && (
        <div onClick={closeModal} style={{
          position: "fixed", inset: 0, background: "rgba(30,58,95,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: "16px", padding: "28px",
            maxWidth: "520px", width: "100%", maxHeight: "85vh",
            overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: "0 0 2px 0", fontSize: "22px", color: COLORS.navy }}>
                  {editing ? (draft.doctor || a.doctor) : a.doctor}
                </h2>
                <div style={{ fontSize: "12px", color: editing ? COLORS.yellow : COLORS.muted, fontStyle: "italic" }}>
                  {editing ? "Only changed fields will be saved" : "Viewing full details"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {editing && <button style={{ ...styles.btn("secondary"), color: COLORS.muted }} onClick={() => { setEditing(false); setDraft({}); }}>← View</button>}
                <button onClick={closeModal} style={{
                  background: COLORS.bg, border: "none", borderRadius: "50%",
                  width: "32px", height: "32px", fontSize: "18px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>×</button>
              </div>
            </div>

            {/* ── VIEW MODE ── */}
            {!editing && (<>
              <ModalSection title="Appointment Details">
                {a.specialty && <ModalRow label="Specialty" value={a.specialty} />}
                <ModalRow label="Date" value={new Date(a.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} />
                {a.time     && <ModalRow label="Time"     value={a.time} />}
                {a.location && <ModalRow label="Location" value={a.location} />}
              </ModalSection>
              {a.notes && (
                <ModalSection title="Notes">
                  <div style={{ fontSize: "14px", color: COLORS.navy, lineHeight: "1.6" }}>{a.notes}</div>
                </ModalSection>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", paddingTop: "16px", borderTop: `1px solid ${COLORS.border}` }}>
                <button style={styles.btn("secondary")} onClick={closeModal}>Close</button>
                <button style={styles.btn("primary")} onClick={() => { setDraft({ ...a }); setEditing(true); }}>Edit</button>
              </div>
            </>)}

            {/* ── EDIT MODE ── */}
            {editing && (<>
              <label style={styles.label}>Doctor Name *</label>
              <input style={styles.input} value={draft.doctor} onChange={d("doctor")} />
              <label style={styles.label}>Specialty</label>
              <input style={styles.input} value={draft.specialty} onChange={d("specialty")} />
              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Date *</label>
                  <input style={styles.input} type="date" value={draft.date} onChange={d("date")} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Time</label>
                  <input style={styles.input} type="time" value={draft.time} onChange={d("time")} />
                </div>
              </div>
              <label style={styles.label}>Location / Clinic</label>
              <input style={styles.input} value={draft.location} onChange={d("location")} />
              <label style={styles.label}>Notes</label>
              <textarea style={styles.textarea} value={draft.notes} onChange={d("notes")} />
              <div style={{ display: "flex", gap: "10px", paddingTop: "16px", borderTop: `1px solid ${COLORS.border}` }}>
                <button style={styles.btn("primary")} onClick={savePatch}>Save Changes</button>
                <button style={styles.btn("secondary")} onClick={() => { setEditing(false); setDraft({}); }}>Cancel</button>
              </div>
            </>)}
          </div>
        </div>
      )}
    </>
  );
}

// ─── SYMPTOM LOG ──────────────────────────────────────────────
function SymptomLog({ logs, update, actor, patient }) {
  const MOODS = ["😊 Good", "😐 Okay", "😔 Not great", "😣 Poor"];
  const empty = { date: new Date().toISOString().split("T")[0], mood: "", note: "", symptoms: "" };
  const [form, setForm] = useState(empty);
  const [adding, setAdding] = useState(false);

  const add = () => {
    if (!form.note.trim()) return;
    const newRecord = { ...form, id: Date.now() };
    const event = buildEvent({ actor, patient, section: "logs", action: "ADD", record: newRecord });
    update([...logs, newRecord], event);
    setForm({ ...empty, date: new Date().toISOString().split("T")[0] });
    setAdding(false);
  };
  const remove = (id) => {
    const record = logs.find(l => l.id === id);
    const event = buildEvent({ actor, patient, section: "logs", action: "REMOVE", record });
    update(logs.filter(l => l.id !== id), event);
  };
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "21px", margin: 0 }}>Health Log</h2>
        <button style={styles.btn("primary")} onClick={() => setAdding(!adding)}>
          {adding ? "Cancel" : "+ Add Entry"}
        </button>
      </div>

      {adding && (
        <div style={{ ...styles.card, border: `2px solid ${COLORS.teal}` }}>
          <div style={styles.sectionTitle}>New Health Entry</div>
          <label style={styles.label}>Date</label>
          <input style={styles.input} type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          <label style={styles.label}>How are they feeling?</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            {MOODS.map(m => (
              <button key={m} onClick={() => setForm({ ...form, mood: m })}
                style={{ padding: "8px 14px", borderRadius: "20px", border: "2px solid", borderColor: form.mood === m ? COLORS.teal : COLORS.border, background: form.mood === m ? COLORS.tealLight : "#fff", cursor: "pointer", fontSize: "14px", fontFamily: SF }}>
                {m}
              </button>
            ))}
          </div>
          <label style={styles.label}>Symptoms</label>
          <input style={styles.input} placeholder="e.g. Headache, fatigue, shortness of breath" value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} />
          <label style={styles.label}>Notes *</label>
          <textarea style={styles.textarea} placeholder="What happened today? Any concerns? Changes in condition?" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          <button style={styles.btn("primary")} onClick={add}>Save Entry</button>
        </div>
      )}

      {logs.length === 0 && !adding && (
        <div style={{ ...styles.emptyState, ...styles.card }}>No health log entries yet. Click "Add Entry" to start tracking.</div>
      )}

      {sorted.map(l => (
        <div key={l.id} style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "14px", color: COLORS.muted, marginBottom: "4px" }}>
                {new Date(l.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </div>
              {l.mood && <span style={styles.badge(COLORS.coral)}>{l.mood}</span>}
              {l.symptoms && <div style={{ marginTop: "8px", fontSize: "14px" }}><strong>Symptoms:</strong> {l.symptoms}</div>}
              <div style={{ marginTop: "8px", fontSize: "15px", color: COLORS.navy }}>{l.note}</div>
            </div>
            <button style={styles.btn("danger")} onClick={() => remove(l.id)}>Remove</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ACTIVITY LOG ─────────────────────────────────────────────
const ACTION_META = {
  ADD:    { label: "Added",   color: "#2A7B6F", bg: "#E8F5F2", icon: "+" },
  PATCH:  { label: "Edited",  color: "#F5A623", bg: "#FEF8EC", icon: "Edit" },
  REMOVE: { label: "Removed", color: "#E8694A", bg: "#FDF0EC", icon: "—" },
};

const SECTION_LABELS = { meds: "Medication", appts: "Appointment", logs: "Health Log" };

function formatUTC(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
    timeZone: "UTC",
  }) + " UTC";
}

function FieldDiff({ field, change }) {
  const fmt = (v) => {
    if (v === undefined || v === null || v === "") return <em style={{ color: COLORS.muted }}>empty</em>;
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (Array.isArray(v)) return `${v.length} item${v.length !== 1 ? "s" : ""}`;
    return String(v);
  };
  return (
    <div style={{ fontSize: "13px", display: "flex", gap: "6px", alignItems: "baseline", flexWrap: "wrap", padding: "3px 0" }}>
      <span style={{ fontWeight: "bold", color: COLORS.navy, minWidth: "120px", flexShrink: 0 }}>{field}</span>
      {"from" in change && <span style={{ color: COLORS.muted, textDecoration: "line-through" }}>{fmt(change.from)}</span>}
      {"from" in change && "to" in change && <span style={{ color: COLORS.muted }}>→</span>}
      {"to" in change && <span style={{ color: COLORS.teal, fontWeight: "bold" }}>{fmt(change.to)}</span>}
    </div>
  );
}

function ActivityLog() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    loadAuditEvents().then(evts => {
      setEvents([...evts].reverse()); // newest first
      setLoading(false);
    });
  }, []);

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const FILTERS = ["ALL", "ADD", "PATCH", "REMOVE"];
  const filtered = filter === "ALL" ? events : events.filter(e => e.action === filter);

  // Group by date (local)
  const grouped = filtered.reduce((acc, evt) => {
    const day = new Date(evt.timestamp).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    if (!acc[day]) acc[day] = [];
    acc[day].push(evt);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ fontSize: "21px", margin: 0 }}>Activity Log</h2>
        <div style={{ display: "flex", gap: "6px" }}>
          {FILTERS.map(f => {
            const meta = f === "ALL" ? null : ACTION_META[f];
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "6px 14px", borderRadius: "20px", border: "1.5px solid",
                borderColor: filter === f ? (meta?.color || COLORS.teal) : COLORS.border,
                background: filter === f ? (meta?.bg || COLORS.tealLight) : "#fff",
                color: filter === f ? (meta?.color || COLORS.teal) : COLORS.muted,
                fontSize: "13px", fontWeight: filter === f ? "bold" : "normal",
                cursor: "pointer", fontFamily: SF,
              }}>
                {meta ? `${meta.icon} ${f}` : "All"}
                {f !== "ALL" && <span style={{ marginLeft: "4px", fontSize: "11px" }}>({events.filter(e => e.action === f).length})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {loading && <div style={styles.emptyState}>Loading activity...</div>}
      {!loading && filtered.length === 0 && (
        <div style={{ ...styles.emptyState, ...styles.card }}>
          No activity yet. Start adding medications, appointments, or health logs and they'll appear here.
        </div>
      )}

      {!loading && Object.entries(grouped).map(([day, dayEvents]) => (
        <div key={day}>
          <div style={{ fontSize: "12px", color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: "bold", margin: "20px 0 8px 4px" }}>{day}</div>
          {dayEvents.map(evt => {
            const meta = ACTION_META[evt.action] || ACTION_META.ADD;
            const isOpen = expanded[evt.id];
            const changeCount = Object.keys(evt.changes || {}).length;
            return (
              <div key={evt.id} style={{ ...styles.card, background: meta.bg, marginBottom: "10px", cursor: changeCount > 0 ? "pointer" : "default" }}
                onClick={() => changeCount > 0 && toggleExpand(evt.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    {/* Action badge */}
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: meta.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0, marginTop: "2px" }}>
                      {meta.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", color: COLORS.navy }}>
                        <strong>{evt.actor}</strong>
                        {" "}<span style={{ color: meta.color, fontWeight: "bold" }}>{meta.label.toLowerCase()}</span>{" "}
                        <strong>{evt.recordName}</strong>
                        {" "}<span style={{ color: COLORS.muted, fontSize: "13px" }}>({SECTION_LABELS[evt.section] || evt.section})</span>
                        {" — "}<span style={{ color: COLORS.muted, fontSize: "13px" }}>{evt.patient}</span>
                      </div>
                      <div style={{ fontSize: "12px", color: COLORS.muted, marginTop: "3px" }}>{formatUTC(evt.timestamp)}</div>
                    </div>
                  </div>
                  {changeCount > 0 && (
                    <span style={{ fontSize: "13px", color: meta.color, flexShrink: 0, marginTop: "4px" }}>
                      {changeCount} field{changeCount !== 1 ? "s" : ""} {isOpen ? "▲" : "▼"}
                    </span>
                  )}
                </div>

                {/* Expandable field diff */}
                {isOpen && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${COLORS.border}` }}>
                    {Object.entries(evt.changes).map(([field, change]) => (
                      <FieldDiff key={field} field={field} change={change} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SID THE BUNNY — Daily Check-In v2
// ═══════════════════════════════════════════════════════════════
//
// 💡 VOICE UPGRADE PATH:
// Currently uses browser Web Speech API (free, slightly robotic).
// To upgrade: replace speak() in useSidVoice with a call to:
//   ElevenLabs: POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
//   Google TTS:  POST https://texttospeech.googleapis.com/v1/text:synthesize
// The rest of the component is voice-provider agnostic.

// ── Sid SVG ──────────────────────────────────────────────────
function SidBunny({ mood = "happy", size = 120, talking = false }) {
  const mouthPath = mood === "sad"
    ? "M 52 86 Q 60 82 68 86"
    : mood === "neutral" ? "M 52 85 Q 60 85 68 85"
    : "M 52 83 Q 60 90 68 83";
  const eyeY   = mood === "sad" ? 72 : 70;
  const blush  = mood === "happy" ? 0.5 : 0.2;
  const wiggle = talking ? "sid-ear 0.4s ease-in-out infinite alternate" : "none";
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 120 156" fill="none">
      <style>{`
        @keyframes sid-ear  { from { transform-origin:38px 38px; transform:rotate(-5deg); } to { transform-origin:38px 38px; transform:rotate(5deg); } }
        @keyframes sid-earR { from { transform-origin:82px 38px; transform:rotate(5deg);  } to { transform-origin:82px 38px; transform:rotate(-5deg); } }
        .se-l { animation: ${wiggle}; }
        .se-r { animation: ${talking ? "sid-earR 0.4s ease-in-out infinite alternate" : "none"}; }
      `}</style>
      <ellipse cx="60" cy="152" rx="28" ry="5" fill="rgba(0,0,0,0.07)"/>
      <g className="se-l"><ellipse cx="38" cy="32" rx="12" ry="28" fill="#F5E6F0" stroke="#E8C4DC" strokeWidth="1.5"/><ellipse cx="38" cy="32" rx="6" ry="20" fill="#F0A8C8"/></g>
      <g className="se-r"><ellipse cx="82" cy="32" rx="12" ry="28" fill="#F5E6F0" stroke="#E8C4DC" strokeWidth="1.5"/><ellipse cx="82" cy="32" rx="6" ry="20" fill="#F0A8C8"/></g>
      <ellipse cx="60" cy="128" rx="30" ry="26" fill="#F5E6F0" stroke="#E8C4DC" strokeWidth="1.5"/>
      <ellipse cx="60" cy="130" rx="18" ry="16" fill="white" opacity="0.6"/>
      <circle cx="60" cy="76" r="32" fill="#F5E6F0" stroke="#E8C4DC" strokeWidth="1.5"/>
      <circle cx="50" cy={eyeY} r="5" fill="white"/><circle cx="70" cy={eyeY} r="5" fill="white"/>
      <circle cx={mood==="sad"?49:51} cy={eyeY} r="3" fill="#2A2A2A"/><circle cx={mood==="sad"?69:71} cy={eyeY} r="3" fill="#2A2A2A"/>
      <circle cx={mood==="sad"?50:52} cy={eyeY-1} r="1" fill="white"/><circle cx={mood==="sad"?70:72} cy={eyeY-1} r="1" fill="white"/>
      <ellipse cx="60" cy="80" rx="4" ry="3" fill="#F0A8C8"/>
      <path d={mouthPath} stroke="#C87AA0" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <line x1="34" y1="79" x2="54" y2="81" stroke="#C8B0C0" strokeWidth="1" opacity="0.6"/>
      <line x1="34" y1="83" x2="54" y2="83" stroke="#C8B0C0" strokeWidth="1" opacity="0.6"/>
      <line x1="66" y1="81" x2="86" y2="79" stroke="#C8B0C0" strokeWidth="1" opacity="0.6"/>
      <line x1="66" y1="83" x2="86" y2="83" stroke="#C8B0C0" strokeWidth="1" opacity="0.6"/>
      <ellipse cx="42" cy="80" rx="7" ry="4" fill="#F0A8C8" opacity={blush}/>
      <ellipse cx="78" cy="80" rx="7" ry="4" fill="#F0A8C8" opacity={blush}/>
      <ellipse cx="34" cy="118" rx="8" ry="14" fill="#F5E6F0" stroke="#E8C4DC" strokeWidth="1.5" transform="rotate(-15 34 118)"/>
      <ellipse cx="86" cy="118" rx="8" ry="14" fill="#F5E6F0" stroke="#E8C4DC" strokeWidth="1.5" transform="rotate(15 86 118)"/>
      <circle cx="84" cy="138" r="8" fill="white" stroke="#E8C4DC" strokeWidth="1"/>
      {talking && (
        <g>
          {[0,1,2].map(i => (
            <circle key={i} cx={93+i*8} cy={64-i*6} r="3" fill={COLORS.teal} opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.15;0.7" dur="0.9s" begin={`${i*0.2}s`} repeatCount="indefinite"/>
            </circle>
          ))}
        </g>
      )}
    </svg>
  );
}

// ── Voice output (TTS) ────────────────────────────────────────
function useSidVoice() {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const speak = (text, onEnd) => {
    if (!supported) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    // Make it sound as warm as possible with browser TTS
    utt.rate = 0.88;   // slightly slower = warmer
    utt.pitch = 1.15;  // slightly higher = friendlier
    utt.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      ["Samantha","Karen","Moira","Allison","Ava","Susan"].some(n => v.name.includes(n))
    ) || voices.find(v => v.lang === "en-US" && v.localService);
    if (preferred) utt.voice = preferred;
    utt.onend = () => onEnd?.();
    window.speechSynthesis.speak(utt);
  };
  const stop = () => window.speechSynthesis?.cancel();
  return { speak, stop, supported };
}

// ── Voice input — simple textarea (mic can be added later) ───
function VoiceTextField({ value, onChange, placeholder, minHeight = "80px" }) {
  return (
    <textarea
      style={{ ...styles.textarea, minHeight, marginBottom: 0 }}
      placeholder={placeholder || "Type your answer here..."}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}


// ── Emotion Wheel ─────────────────────────────────────────────
// 4 quadrants × 5 emotions each = 20 selectable outer segments
// Inner ring shows core emoji faces. Outer ring is clickable.
// Pill buttons below are synced with wheel selection.

const CX = 140, CY = 140, INNER_R = 50, MID_R = 93, OUTER_R = 135;

const WHEEL_QUADRANTS = [
  { id: "happy", emoji: "😄", color: "#4FB87A", darkColor: "#3A9060", label: "Happy",   startAngle: 180, endAngle: 270 },
  { id: "sad",   emoji: "😢", color: "#6AAEE0", darkColor: "#4888C0", label: "Sad",     startAngle: 270, endAngle: 360 },
  { id: "angry", emoji: "😠", color: "#E07878", darkColor: "#C04848", label: "Angry",   startAngle: 0,   endAngle: 90  },
  { id: "meh",   emoji: "😐", color: "#F0C840", darkColor: "#C89010", label: "Worried", startAngle: 90,  endAngle: 180 },
];

const WHEEL_EMOTIONS = [
  // Green / Happy (180→270) — 3 × 30°
  { id: "happy",   label: "Happy",   q: "happy", color: "#72D095", sa: 180, ea: 210 },
  { id: "excited", label: "Excited", q: "happy", color: "#52BC75", sa: 210, ea: 240 },
  { id: "calm",    label: "Calm",    q: "happy", color: "#32A455", sa: 240, ea: 270 },
  // Blue / Sad (270→360) — 3 × 30°
  { id: "tired",  label: "Tired",  q: "sad", color: "#A8D4F8", sa: 270, ea: 300 },
  { id: "lonely", label: "Lonely", q: "sad", color: "#78B4E8", sa: 300, ea: 330 },
  { id: "sad",    label: "Sad",    q: "sad", color: "#4894D8", sa: 330, ea: 360 },
  // Red / Angry (0→90) — 3 × 30°
  { id: "angry",       label: "Angry",       q: "angry", color: "#F5AAAA", sa: 0,  ea: 30 },
  { id: "scared",      label: "Scared",      q: "angry", color: "#E77878", sa: 30, ea: 60 },
  { id: "frustrated",  label: "Frustrated",  q: "angry", color: "#D94848", sa: 60, ea: 90 },
  // Yellow / Worried (90→180) — 3 × 30°
  { id: "worried",  label: "Worried",  q: "meh", color: "#F8E080", sa: 90,  ea: 120 },
  { id: "nervous",  label: "Nervous",  q: "meh", color: "#E8C050", sa: 120, ea: 150 },
  { id: "anxious",  label: "Anxious",  q: "meh", color: "#D8A020", sa: 150, ea: 180 },
];

function polarXY(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r1, r2, sa, ea) {
  const large = (ea - sa) % 360 > 180 ? 1 : 0;
  const p1 = polarXY(cx, cy, r1, sa), p2 = polarXY(cx, cy, r1, ea);
  const p3 = polarXY(cx, cy, r2, ea), p4 = polarXY(cx, cy, r2, sa);
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${r1} ${r1} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${r2} ${r2} 0 ${large} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

function EmotionWheel({ selected, onToggle }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div>
      {/* SVG Wheel */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
        <svg viewBox="0 0 280 280" width="260" height="260" style={{ overflow: "visible" }}>
          <defs>
            {WHEEL_EMOTIONS.map(e => {
              const mid = (e.sa + e.ea) / 2;
              const isBottom = mid > 0 && mid < 180;
              const arcR = (MID_R + OUTER_R) / 2;
              const p1 = isBottom
                ? polarXY(CX, CY, arcR, e.ea - 0.5)
                : polarXY(CX, CY, arcR, e.sa + 0.5);
              const p2 = isBottom
                ? polarXY(CX, CY, arcR, e.sa + 0.5)
                : polarXY(CX, CY, arcR, e.ea - 0.5);
              return (
                <path key={`tp-${e.id}`} id={`tp-${e.id}`}
                  d={`M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${arcR} ${arcR} 0 0 ${isBottom ? 0 : 1} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`}
                />
              );
            })}
          </defs>

          {/* Inner quadrant sectors */}
          {WHEEL_QUADRANTS.map(q => {
            const path = arcPath(CX, CY, INNER_R, MID_R, q.startAngle, q.endAngle);
            const mid = (q.startAngle + q.endAngle) / 2;
            const ep = polarXY(CX, CY, (INNER_R + MID_R) / 2, mid);
            return (
              <g key={q.id}>
                <path d={path} fill={q.darkColor} stroke="white" strokeWidth="1.5"/>
                <text x={ep.x} y={ep.y} textAnchor="middle" dominantBaseline="middle" fontSize="22" style={{ pointerEvents: "none", userSelect: "none" }}>
                  {q.emoji}
                </text>
              </g>
            );
          })}

          {/* Outer emotion segments */}
          {WHEEL_EMOTIONS.map(e => {
            const isSelected = Array.isArray(selected) && selected.includes(e.id);
            const isHovered  = hovered === e.id;
            const path = arcPath(CX, CY, MID_R + 1, OUTER_R, e.sa, e.ea);
            return (
              <g key={e.id}
                onMouseEnter={() => setHovered(e.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onToggle(e.id)}
                style={{ cursor: "pointer" }}
              >
                <path
                  d={path}
                  fill={isSelected ? e.color : isHovered ? e.color + "CC" : e.color + "88"}
                  stroke="white"
                  strokeWidth="1.5"
                  style={{ transition: "fill 0.15s" }}
                />
                <text fontSize="8.5" fill={isSelected ? "#1E3A5F" : "#444"} fontWeight={isSelected ? "bold" : "normal"} style={{ pointerEvents: "none", userSelect: "none" }}>
                  <textPath href={`#tp-${e.id}`} startOffset="50%" textAnchor="middle">{e.label}</textPath>
                </text>
              </g>
            );
          })}

          {/* Center white circle */}
          <circle cx={CX} cy={CY} r={INNER_R - 1} fill="white"/>

          {/* Outer border */}
          <circle cx={CX} cy={CY} r={OUTER_R + 1} fill="none" stroke={COLORS.border} strokeWidth="1.5"/>
        </svg>
      </div>

      {/* Pill buttons grouped by quadrant */}
      {WHEEL_QUADRANTS.map(q => {
        const emotions = WHEEL_EMOTIONS.filter(e => e.q === q.id);
        return (
          <div key={q.id} style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6px", color: q.darkColor, marginBottom: "6px" }}>
              {q.emoji} {q.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {emotions.map(e => {
                const isSel = Array.isArray(selected) && selected.includes(e.id);
                return (
                  <button key={e.id} onClick={() => onToggle(e.id)} style={{
                    padding: "6px 12px", borderRadius: "16px", border: "2px solid",
                    borderColor: isSel ? q.darkColor : COLORS.border,
                    background: isSel ? e.color : "#fff",
                    color: isSel ? "#fff" : COLORS.muted,
                    fontWeight: isSel ? "bold" : "normal",
                    fontSize: "13px", cursor: "pointer", fontFamily: SF,
                    transition: "all 0.1s",
                  }}>{e.label}</button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Body Diagram (front + back side by side) ──────────────────
const FRONT_REGIONS = [
  { id: "f_head",    label: "Head",             cx: 55,  cy: 18,  rx: 14, ry: 14 },
  { id: "f_neck",    label: "Neck",             cx: 55,  cy: 38,  rx: 7,  ry: 7  },
  { id: "f_chest_l", label: "Chest (left)",     cx: 40,  cy: 58,  rx: 16, ry: 14 },
  { id: "f_chest_r", label: "Chest (right)",    cx: 70,  cy: 58,  rx: 16, ry: 14 },
  { id: "f_abdomen", label: "Abdomen",          cx: 55,  cy: 82,  rx: 16, ry: 12 },
  { id: "f_lshoulder",label: "Left Shoulder",  cx: 19,  cy: 50,  rx: 13, ry: 11 },
  { id: "f_rshoulder",label: "Right Shoulder", cx: 91,  cy: 50,  rx: 13, ry: 11 },
  { id: "f_larm",    label: "Left Arm",         cx: 13,  cy: 78,  rx: 9,  ry: 18 },
  { id: "f_rarm",    label: "Right Arm",        cx: 97,  cy: 78,  rx: 9,  ry: 18 },
  { id: "f_lhip",    label: "Left Hip",         cx: 40,  cy: 104, rx: 15, ry: 11 },
  { id: "f_rhip",    label: "Right Hip",        cx: 70,  cy: 104, rx: 15, ry: 11 },
  { id: "f_lthigh",  label: "Left Thigh",       cx: 39,  cy: 130, rx: 13, ry: 16 },
  { id: "f_rthigh",  label: "Right Thigh",      cx: 71,  cy: 130, rx: 13, ry: 16 },
  { id: "f_lknee",   label: "Left Knee",        cx: 39,  cy: 158, rx: 10, ry: 10 },
  { id: "f_rknee",   label: "Right Knee",       cx: 71,  cy: 158, rx: 10, ry: 10 },
  { id: "f_lshin",   label: "Left Shin",        cx: 38,  cy: 180, rx: 9,  ry: 14 },
  { id: "f_rshin",   label: "Right Shin",       cx: 72,  cy: 180, rx: 9,  ry: 14 },
];

const BACK_REGIONS = [
  { id: "b_head",    label: "Head (back)",      cx: 55,  cy: 18,  rx: 14, ry: 14 },
  { id: "b_neck",    label: "Neck (back)",      cx: 55,  cy: 38,  rx: 7,  ry: 7  },
  { id: "b_upback",  label: "Upper Back",       cx: 55,  cy: 58,  rx: 22, ry: 14 },
  { id: "b_midback", label: "Mid Back",         cx: 55,  cy: 78,  rx: 18, ry: 10 },
  { id: "b_lowback", label: "Lower Back",       cx: 55,  cy: 95,  rx: 16, ry: 10 },
  { id: "b_lshoulder",label: "L Shoulder (back)", cx: 26, cy: 52, rx: 14, ry: 11 },
  { id: "b_rshoulder",label: "R Shoulder (back)", cx: 84, cy: 52, rx: 14, ry: 11 },
  { id: "b_larm",    label: "Left Arm (back)",  cx: 13,  cy: 78,  rx: 9,  ry: 18 },
  { id: "b_rarm",    label: "Right Arm (back)", cx: 97,  cy: 78,  rx: 9,  ry: 18 },
  { id: "b_lglute",  label: "Left Glute",       cx: 40,  cy: 110, rx: 15, ry: 12 },
  { id: "b_rglute",  label: "Right Glute",      cx: 70,  cy: 110, rx: 15, ry: 12 },
  { id: "b_lham",    label: "Left Hamstring",   cx: 39,  cy: 135, rx: 12, ry: 16 },
  { id: "b_rham",    label: "Right Hamstring",  cx: 71,  cy: 135, rx: 12, ry: 16 },
  { id: "b_lcalf",   label: "Left Calf",        cx: 38,  cy: 168, rx: 9,  ry: 16 },
  { id: "b_rcalf",   label: "Right Calf",       cx: 72,  cy: 168, rx: 9,  ry: 16 },
];

const ALL_BODY_REGIONS = [...FRONT_REGIONS, ...BACK_REGIONS];

function BodySVG({ regions, selected, onToggle, label }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.6px", color: COLORS.muted, marginBottom: "6px" }}>{label}</div>
      <svg viewBox="0 0 110 200" width="105" height="195" style={{ overflow: "visible" }}>
        {/* Body silhouette */}
        <circle cx="55" cy="18" r="13" fill="#EDD8E8" stroke="#D4B8CC" strokeWidth="1"/>
        <rect x="36" y="30" width="38" height="10" rx="5" fill="#EDD8E8" stroke="#D4B8CC" strokeWidth="1"/>
        <rect x="28" y="40" width="54" height="62" rx="8" fill="#EDD8E8" stroke="#D4B8CC" strokeWidth="1"/>
        <rect x="6" y="44" width="22" height="55" rx="8" fill="#EDD8E8" stroke="#D4B8CC" strokeWidth="1"/>
        <rect x="82" y="44" width="22" height="55" rx="8" fill="#EDD8E8" stroke="#D4B8CC" strokeWidth="1"/>
        <rect x="30" y="100" width="50" height="30" rx="6" fill="#EDD8E8" stroke="#D4B8CC" strokeWidth="1"/>
        <rect x="28" y="126" width="22" height="50" rx="8" fill="#EDD8E8" stroke="#D4B8CC" strokeWidth="1"/>
        <rect x="60" y="126" width="22" height="50" rx="8" fill="#EDD8E8" stroke="#D4B8CC" strokeWidth="1"/>
        <rect x="27" y="172" width="24" height="20" rx="6" fill="#EDD8E8" stroke="#D4B8CC" strokeWidth="1"/>
        <rect x="59" y="172" width="24" height="20" rx="6" fill="#EDD8E8" stroke="#D4B8CC" strokeWidth="1"/>

        {/* Clickable regions */}
        {regions.map(r => {
          const isSel = Array.isArray(selected) && selected.includes(r.id);
          const isHov = hovered === r.id;
          return (
            <ellipse key={r.id}
              cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry}
              fill={isSel ? "rgba(232,105,74,0.35)" : isHov ? "rgba(42,123,111,0.25)" : "transparent"}
              stroke={isSel ? COLORS.coral : isHov ? COLORS.teal : "transparent"}
              strokeWidth="1.5"
              style={{ cursor: "pointer", transition: "all 0.12s" }}
              onMouseEnter={() => setHovered(r.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onToggle(r.id)}
            />
          );
        })}
      </svg>
    </div>
  );
}

function BodyDiagram({ selected, onToggle }) {
  const toggleArea = (id) => {
    const arr = Array.isArray(selected) ? selected : [];
    onToggle(arr.includes(id) ? arr.filter(x => x !== id) : [...arr, id]);
  };

  // Pill buttons for selected areas
  const safeSelected = Array.isArray(selected) ? selected : [];
  const selectedRegions = ALL_BODY_REGIONS.filter(r => safeSelected.includes(r.id));

  return (
    <div>
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "12px" }}>
        <BodySVG regions={FRONT_REGIONS} selected={selected} onToggle={id => toggleArea(id)} label="Front" />
        <BodySVG regions={BACK_REGIONS}  selected={selected} onToggle={id => toggleArea(id)} label="Back" />
      </div>
      {selectedRegions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {selectedRegions.map(r => (
            <button key={r.id} onClick={() => toggleArea(r.id)} style={{
              padding: "5px 12px", borderRadius: "14px", border: `1.5px solid ${COLORS.coral}`,
              background: COLORS.coralLight, color: COLORS.coral, fontSize: "12px",
              cursor: "pointer", fontFamily: SF, fontWeight: "bold",
            }}>{r.label} ×</button>
          ))}
        </div>
      )}
      <p style={{ fontSize: "12px", color: COLORS.muted, marginTop: "8px", textAlign: "center" }}>
        Tap areas on the body, or use the chips above to deselect
      </p>
    </div>
  );
}

// ── Per-area pain rating ──────────────────────────────────────
const PAIN_TYPES = ["Aching", "Stabbing", "Burning", "Throbbing", "Dull", "Sharp", "Cramping", "Pressure", "Tingling", "Stiff"];

function PainAreaRating({ areaId, areaLabel, detail, onChange }) {
  const d = detail || { types: [], scale: 0 };
  const toggleType = (t) => onChange({ ...d, types: d.types.includes(t) ? d.types.filter(x => x !== t) : [...d.types, t] });
  const setScale  = (s) => onChange({ ...d, scale: s });

  return (
    <div style={{ background: COLORS.coralLight, borderRadius: "12px", padding: "14px 16px", marginBottom: "12px", border: `1.5px solid ${COLORS.coral}22` }}>
      <div style={{ fontWeight: "bold", color: COLORS.navy, marginBottom: "10px", fontSize: "15px" }}>{areaLabel}</div>

      <div style={{ fontSize: "12px", color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Type of pain</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
        {PAIN_TYPES.map(t => {
          const active = Array.isArray(d.types) && d.types.includes(t);
          return (
            <button key={t} onClick={() => toggleType(t)} style={{
              padding: "5px 11px", borderRadius: "14px", border: "1.5px solid",
              borderColor: active ? COLORS.coral : COLORS.border,
              background: active ? COLORS.coral : "#fff",
              color: active ? "#fff" : COLORS.muted,
              fontSize: "12px", cursor: "pointer", fontFamily: SF,
              transition: "all 0.1s",
            }}>{t}</button>
          );
        })}
      </div>

      <div style={{ fontSize: "12px", color: COLORS.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>Pain level — {d.scale > 0 ? `${d.scale}/10` : "tap to rate"}</div>
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <button key={n} onClick={() => setScale(n)} style={{
            width: "32px", height: "32px", borderRadius: "8px", border: "1.5px solid",
            borderColor: d.scale >= n ? COLORS.coral : COLORS.border,
            background: d.scale >= n ? COLORS.coral : "#fff",
            color: d.scale >= n ? "#fff" : COLORS.muted,
            fontSize: "13px", fontWeight: "bold", cursor: "pointer",
            fontFamily: SF, transition: "all 0.1s",
          }}>{n}</button>
        ))}
      </div>
    </div>
  );
}

// ── Question scripts ─────────────────────────────────────────
const Q = {
  mood:        ["Hey! So how's today been treating you, mood-wise?", "Alright, real talk — how are you actually feeling today?", "Let's check in on how you're doing emotionally. What kind of day has it been?", "How's the heart today? Give me the vibe.", "Checking in! Emotionally speaking, how's everything going?"],
  moodFollow:  ["That makes sense. Want to tell me a bit more about that?", "Got it — anything in particular that's been on your mind?", "Thanks for sharing that. Is there more you'd like to say about it?"],
  pain:        ["Okay, body check time! Any aches or pains today?", "How's the body feeling? Anything hurting or uncomfortable?", "Let's see how you're doing physically — any pain going on today?"],
  digestion:   ["One more thing — how has your stomach and digestion been today?", "Quick gut check, literally! Everything okay on the digestion front?", "And how about your digestion today — all good, or anything to note?"],
  sleep:       ["Let's talk sleep! How'd last night go for you?", "Rise and shine — well, hopefully! How was the sleep last night?", "How'd you sleep? Give me the honest version."],
};
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Negative emotions that trigger a follow-up
const NEGATIVE_EMOTIONS = ["sad","lonely","tired","frustrated","scared","angry","worried","nervous","anxious"];

const WAKE_FEELINGS = ["Rested","Sleepy","Groggy","Refreshed","Achy","Anxious","Good to go"];

function checkinKeyV2(patient) {
  return `checkin:${patient}:${new Date().toISOString().split("T")[0]}`;
}

// ── Main Check-In Component ───────────────────────────────────
function CheckIn({ patient }) {
  const { speak, stop, supported: voiceSupported } = useSidVoice();

  // Phase navigation stack — back button pops without clearing answers
  const [phaseStack, setPhaseStack] = useState(["intro"]);
  const phase = phaseStack[phaseStack.length - 1];
  const goTo  = (p) => setPhaseStack(s => [...s, p]);
  const goBack = () => { stop(); setPhaseStack(s => s.length > 1 ? s.slice(0, -1) : s); };

  // Sid state
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [talking, setTalking]       = useState(false);
  const [sidMood, setSidMood]       = useState("happy");
  const [currentQ, setCurrentQ]     = useState("");

  // Data
  const [todayData, setTodayData] = useState(null);
  const [loaded, setLoaded]       = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Form state
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [moodNote,    setMoodNote]    = useState("");
  const [painAreas,   setPainAreas]   = useState([]);
  const [areaDetails, setAreaDetails] = useState({}); // { areaId: { types, scale } }
  const [painNote,    setPainNote]    = useState("");
  const [bowelMovement, setBowelMovement] = useState(null);   // "yes" | "no"
  const [digestionIssues, setDigestionIssues] = useState([]);    // multi-select array
  const [digestionNote, setDigestionNote] = useState("");
  const [sleepScale,  setSleepScale]  = useState(0);
  const [sleepHours,  setSleepHours]  = useState("");
  const [wakeFeeling, setWakeFeeling] = useState(null);
  const [tookNap,     setTookNap]     = useState(null);
  const [napDuration, setNapDuration] = useState("");

  useEffect(() => {
    window.storage.get(checkinKeyV2(patient))
      .then(r => { if (r) setTodayData(JSON.parse(r.value)); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [patient]);

  const sidSay = (text, onDone) => {
    setCurrentQ(text);
    if (!voiceMuted && voiceSupported) {
      setTalking(true);
      speak(text, () => { setTalking(false); onDone?.(); });
    }
  };

  const PHASE_PROGRESS = { intro: 0, mood: 20, pain: 40, pain_detail: 58, digestion: 74, sleep: 88, done: 100 };

  // ── Navigation helpers ──────────────────────────────────────
  const startCheckin = () => {
    const q = pick(Q.mood);
    goTo("mood");
    setTimeout(() => sidSay(q), 150);
  };

  const submitMood = () => {
    const hasNeg = selectedMoods.some(id => NEGATIVE_EMOTIONS.includes(id));
    setSidMood(hasNeg ? "sad" : "happy");
    const q = pick(Q.pain);
    goTo("pain");
    sidSay(q);
  };

  const submitPain = () => {
    if (painAreas.length > 0) { goTo("pain_detail"); }
    else { const q = pick(Q.digestion); goTo("digestion"); sidSay(q); }
  };

  const submitPainDetail = () => {
    const q = pick(Q.digestion);
    goTo("digestion");
    sidSay(q);
  };

  const submitDigestion = () => {
    const q = pick(Q.sleep);
    goTo("sleep");
    sidSay(q);
  };

  const submitSleep = async () => {
    const data = {
      date: new Date().toISOString().split("T")[0],
      completedAt: new Date().toISOString(),
      mood: { selected: selectedMoods, note: moodNote },
      pain: { areas: painAreas, areaDetails, note: painNote },
      digestion: { bowelMovement, issues: digestionIssues, note: digestionNote },
      sleep: { scale: sleepScale, hours: sleepHours, wakeFeeling, tookNap, napDuration },
    };
    await window.storage.set(checkinKeyV2(patient), JSON.stringify(data)).catch(() => {});
    setTodayData(data);
    goTo("done");
    setSidMood("happy");
    sidSay("All done! That's the check-in for today — you did great. I'll be here again tomorrow!");
  };

  const resetCheckin = async () => {
    stop();
    await window.storage.delete(checkinKeyV2(patient)).catch(() => {});
    setTodayData(null); setPhaseStack(["intro"]); setCurrentQ("");
    setSelectedMoods([]); setMoodNote(""); setPainAreas([]); setAreaDetails({});
    setPainNote(""); setBowelMovement(null); setDigestionIssues([]); setDigestionNote("");
    setSleepScale(0); setSleepHours(""); setWakeFeeling(null); setTookNap(null); setNapDuration("");
    setSidMood("happy");
  };

  const toggleMood = (id) => setSelectedMoods(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  if (!loaded) return <div style={styles.emptyState}>Loading...</div>;
  if (showCalendar) return <CheckInCalendar patient={patient} onBack={() => setShowCalendar(false)} />;

  return (
    <div style={{ maxWidth: "540px", margin: "0 auto" }}>

      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {phase !== "intro" && phase !== "done" && (
            <button onClick={goBack} style={{
              background: COLORS.bg, border: `1px solid ${COLORS.border}`,
              borderRadius: "8px", padding: "6px 12px", cursor: "pointer",
              fontSize: "13px", color: COLORS.muted, fontFamily: SF,
            }}>← Back</button>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setShowCalendar(true)} style={{
            background: COLORS.bg, border: `1px solid ${COLORS.border}`,
            borderRadius: "8px", padding: "6px 12px", cursor: "pointer",
            fontSize: "13px", color: COLORS.muted, fontFamily: SF,
          }}>📅 History</button>
          {voiceSupported && (
            <button onClick={() => { setVoiceMuted(m => !m); if (!voiceMuted) stop(); }} style={{
              background: COLORS.bg, border: `1px solid ${COLORS.border}`,
              borderRadius: "8px", padding: "6px 12px", cursor: "pointer",
              fontSize: "13px", color: voiceMuted ? COLORS.muted : COLORS.teal,
              fontFamily: SF,
            }}>{voiceMuted ? "🔇 Muted" : "🔊 Voice on"}</button>
          )}
        </div>
      </div>

      {/* Sid + speech bubble */}
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{ flexShrink: 0 }}>
          <SidBunny mood={sidMood} size={76} talking={talking} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "bold", color: COLORS.navy, fontSize: "15px", marginBottom: "4px" }}>Sid 🐰</div>
          {currentQ && phase !== "intro" ? (
            <div style={{
              background: COLORS.tealLight, border: `1.5px solid ${COLORS.teal}`,
              borderRadius: "12px", padding: "10px 14px", fontSize: "14px",
              color: COLORS.navy, lineHeight: 1.6, position: "relative",
            }}>
              {currentQ}
              {voiceSupported && !voiceMuted && (
                <button onClick={() => sidSay(currentQ)} title="Replay" style={{
                  marginLeft: "8px", background: "none", border: "none",
                  cursor: "pointer", fontSize: "14px", verticalAlign: "middle",
                }}>🔊</button>
              )}
            </div>
          ) : phase === "intro" ? (
            <div style={{ background: COLORS.tealLight, border: `1.5px solid ${COLORS.teal}`, borderRadius: "12px", padding: "10px 14px", fontSize: "14px", color: COLORS.navy, lineHeight: 1.6 }}>
              {todayData ? "Hey! You've already checked in today — nice work! 🎉" : "Hey there! Ready for our daily check-in? It'll only take a couple of minutes."}
            </div>
          ) : null}
        </div>
      </div>

      {/* Progress bar */}
      {phase !== "intro" && (
        <div style={{ background: "rgba(120,120,128,0.16)", borderRadius: "4px", height: "4px", marginBottom: "18px", overflow: "hidden" }}>
          <div style={{ background: COLORS.teal, height: "100%", width: `${PHASE_PROGRESS[phase] || 0}%`, transition: "width 0.4s ease", borderRadius: "4px" }}/>
        </div>
      )}

      {/* ── INTRO ── */}
      {phase === "intro" && (
        <div style={styles.card}>
          {todayData ? (
            <div>
              <CheckInSummaryV2 data={todayData} />
              <button style={{ ...styles.btn("secondary"), marginTop: "16px", width: "100%" }} onClick={resetCheckin}>Redo today's check-in</button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <p style={{ fontSize: "14px", color: COLORS.muted, marginBottom: "24px", lineHeight: 1.6 }}>
                We'll check in on your <strong>mood</strong>, any <strong>pain</strong>, <strong>digestion</strong>, and how you <strong>slept</strong>. Should take about 2 minutes!
              </p>
              <button style={{ ...styles.btn("primary"), padding: "14px 40px", fontSize: "16px", width: "100%" }} onClick={startCheckin}>
                Let's go! →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MOOD ── */}
      {phase === "mood" && (
        <div style={styles.card}>
          <div style={{ ...styles.sectionTitle, marginBottom: "4px" }}>How are you feeling?</div>
          <p style={{ fontSize: "13px", color: COLORS.muted, marginBottom: "16px" }}>Pick as many as feel true — tap the wheel or the buttons below.</p>
          <EmotionWheel selected={selectedMoods} onToggle={toggleMood} />
          <div style={{ marginTop: "16px" }}>
            <label style={styles.label}>Anything to add? (optional)</label>
            <VoiceTextField value={moodNote} onChange={setMoodNote} placeholder="Tell Sid more if you'd like..." />
          </div>
          <button style={styles.btn("primary")} onClick={submitMood} disabled={selectedMoods.length === 0}>Next →</button>
        </div>
      )}



      {/* ── PAIN ── */}
      {phase === "pain" && (
        <div style={styles.card}>
          <div style={{ ...styles.sectionTitle, marginBottom: "4px" }}>Any pain today?</div>
          <p style={{ fontSize: "13px", color: COLORS.muted, marginBottom: "14px" }}>Tap an area on the front or back of the body, or use the chips to select/deselect.</p>
          <BodyDiagram selected={painAreas} onToggle={setPainAreas} />
          <div style={{ marginTop: "14px" }}>
            <label style={styles.label}>Or just describe it in your own words (optional)</label>
            <VoiceTextField value={painNote} onChange={setPainNote} placeholder="e.g. my lower back has been sore all day..." />
          </div>
          <button style={styles.btn("primary")} onClick={submitPain}>
            {painAreas.length > 0 ? `Next — rate ${painAreas.length} area${painAreas.length > 1 ? "s" : ""} →` : "No pain today →"}
          </button>
        </div>
      )}

      {/* ── PAIN DETAIL ── */}
      {phase === "pain_detail" && (
        <div style={styles.card}>
          <div style={{ ...styles.sectionTitle, marginBottom: "4px" }}>Let's break it down</div>
          <p style={{ fontSize: "13px", color: COLORS.muted, marginBottom: "14px" }}>For each area, pick the type of pain and rate how bad it is.</p>
          {painAreas.map(id => {
            const region = ALL_BODY_REGIONS.find(r => r.id === id);
            return region ? (
              <PainAreaRating key={id} areaId={id} areaLabel={region.label}
                detail={areaDetails[id]}
                onChange={d => setAreaDetails(prev => ({ ...prev, [id]: d }))}
              />
            ) : null;
          })}
          <button style={styles.btn("primary")} onClick={submitPainDetail}>Next →</button>
        </div>
      )}

      {/* ── DIGESTION ── */}
      {phase === "digestion" && (
        <div style={styles.card}>
          <div style={{ ...styles.sectionTitle, marginBottom: "4px" }}>Digestion check 🫃</div>
          <p style={{ fontSize: "13px", color: COLORS.muted, marginBottom: "18px" }}>No judgment here — this stuff matters for your health!</p>

          {/* Q1: Bowel movement */}
          <label style={styles.label}>Did you have a bowel movement today?</label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "22px" }}>
            {[["yes", "Yes"], ["no", "No"]].map(([val, lbl]) => (
              <button key={val} onClick={() => setBowelMovement(val)} style={{
                flex: 1, padding: "12px", borderRadius: "10px", border: "2px solid",
                borderColor: bowelMovement === val ? COLORS.teal : COLORS.border,
                background: bowelMovement === val ? COLORS.tealLight : "#fff",
                color: bowelMovement === val ? COLORS.teal : COLORS.muted,
                fontWeight: bowelMovement === val ? "bold" : "normal",
                fontSize: "15px", cursor: "pointer", fontFamily: SF,
                transition: "all 0.1s",
              }}>{lbl}</button>
            ))}
          </div>

          {/* Q2: Issues — multi-select, "No issues" deselects others */}
          <label style={styles.label}>Any digestive issues today? (pick all that apply)</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            {[
              ["all_good",       "Nope, all good 👍", "#6BA368"],
              ["constipation",   "Constipation",      COLORS.yellow],
              ["diarrhea",       "Diarrhea",          COLORS.coral],
              ["stomach_upset",  "Stomach upset",     "#E07840"],
              ["irregular",      "Irregular",         COLORS.muted],
            ].map(([val, label, color]) => {
              const isSelected = digestionIssues.includes(val);
              return (
                <button key={val} onClick={() => {
                  if (val === "all_good") {
                    setDigestionIssues(isSelected ? [] : ["all_good"]);
                  } else {
                    const withoutGood = digestionIssues.filter(x => x !== "all_good");
                    setDigestionIssues(isSelected
                      ? withoutGood.filter(x => x !== val)
                      : [...withoutGood, val]
                    );
                  }
                }} style={{
                  padding: "10px 16px", borderRadius: "20px", border: "2px solid",
                  borderColor: isSelected ? color : COLORS.border,
                  background: isSelected ? color + "22" : "#fff",
                  color: isSelected ? color : COLORS.muted,
                  fontWeight: isSelected ? "bold" : "normal",
                  fontSize: "14px", cursor: "pointer", fontFamily: SF,
                  transition: "all 0.1s",
                }}>{label}</button>
              );
            })}
          </div>

          <label style={styles.label}>Anything else to add? (optional)</label>
          <VoiceTextField value={digestionNote} onChange={setDigestionNote} placeholder="e.g. bloating, cramps, anything unusual..." />
          <button style={styles.btn("primary")} onClick={submitDigestion} disabled={!bowelMovement}>Next →</button>
        </div>
      )}

      {/* ── SLEEP ── */}
      {phase === "sleep" && (
        <div style={styles.card}>
          <div style={{ ...styles.sectionTitle, marginBottom: "4px" }}>Sleep 😴</div>

          <label style={styles.label}>How'd you rate last night's sleep? {sleepScale > 0 ? `(${sleepScale}/10)` : ""}</label>
          <div style={{ display: "flex", gap: "5px", marginBottom: "16px", flexWrap: "wrap" }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <button key={n} onClick={() => setSleepScale(n)} style={{
                width: "34px", height: "34px", borderRadius: "8px", border: "1.5px solid",
                borderColor: sleepScale >= n ? COLORS.teal : COLORS.border,
                background: sleepScale >= n ? COLORS.teal : "#fff",
                color: sleepScale >= n ? "#fff" : COLORS.muted,
                fontSize: "13px", fontWeight: "bold", cursor: "pointer",
                fontFamily: SF, transition: "all 0.1s",
              }}>{n}</button>
            ))}
          </div>

          <label style={styles.label}>About how many hours?</label>
          <input style={{ ...styles.input, maxWidth: "120px" }} type="number" min="0" max="24" step="0.5" placeholder="e.g. 7" value={sleepHours} onChange={e => setSleepHours(e.target.value)} />

          <label style={styles.label}>How did you feel waking up?</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            {WAKE_FEELINGS.map(f => (
              <button key={f} onClick={() => setWakeFeeling(f)} style={{
                padding: "8px 14px", borderRadius: "20px", border: "1.5px solid",
                borderColor: wakeFeeling === f ? COLORS.teal : COLORS.border,
                background: wakeFeeling === f ? COLORS.tealLight : "#fff",
                color: wakeFeeling === f ? COLORS.teal : COLORS.muted,
                fontWeight: wakeFeeling === f ? "bold" : "normal",
                fontSize: "13px", cursor: "pointer", fontFamily: SF,
              }}>{f}</button>
            ))}
          </div>

          <label style={styles.label}>Did you take a nap today?</label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            {[["yes","Yes 😴"],["no","Nope"]].map(([val, lbl]) => (
              <button key={val} onClick={() => setTookNap(val)} style={{
                flex: 1, padding: "10px", borderRadius: "10px", border: "1.5px solid",
                borderColor: tookNap === val ? COLORS.teal : COLORS.border,
                background: tookNap === val ? COLORS.tealLight : "#fff",
                color: tookNap === val ? COLORS.teal : COLORS.muted,
                fontWeight: tookNap === val ? "bold" : "normal",
                fontSize: "14px", cursor: "pointer", fontFamily: SF,
              }}>{lbl}</button>
            ))}
          </div>
          {tookNap === "yes" && (
            <>
              <label style={styles.label}>How long was it?</label>
              <input style={{ ...styles.input, maxWidth: "160px" }} placeholder="e.g. 45 min" value={napDuration} onChange={e => setNapDuration(e.target.value)} />
            </>
          )}

          <button style={styles.btn("primary")} onClick={submitSleep}>Finish check-in 🎉</button>
        </div>
      )}

      {/* ── DONE ── */}
      {phase === "done" && (
        <div style={{ ...styles.card, textAlign: "center" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:"12px" }}><Icon name="check" size={40} color={COLORS.green} weight={2}/></div>
          <h3 style={{ margin: "0 0 4px 0", color: COLORS.navy }}>All done — great work!</h3>
          <p style={{ color: COLORS.muted, fontSize: "14px", marginBottom: "20px" }}>Come back tomorrow for your next check-in with Sid.</p>
          {todayData && <CheckInSummaryV2 data={todayData} />}
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <button style={{ ...styles.btn("secondary"), flex: 1 }} onClick={() => setShowCalendar(true)}>📅 View history</button>
            <button style={{ ...styles.btn("secondary"), flex: 1 }} onClick={resetCheckin}>Redo check-in</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Check-In Summary ─────────────────────────────────────────
function CheckInSummaryV2({ data }) {
  const moodEmojis = (Array.isArray(data.mood?.selected) ? data.mood.selected : []).map(id => {
    const e = WHEEL_EMOTIONS.find(w => w.id === id);
    return e ? e.label : id;
  });
  const digestLabels = { good: "👍 All good", constipation: "Constipation", diarrhea: "Diarrhea", irregular: "Irregular", other: "Other" };

  return (
    <div style={{ textAlign: "left" }}>
      {moodEmojis.length > 0 && (
        <div style={{ ...styles.itemCard(COLORS.tealLight), marginBottom: "8px" }}>
          <div><strong>Mood:</strong> {moodEmojis.join(", ")}{data.mood?.note ? ` — "${data.mood.note}"` : ""}</div>
        </div>
      )}
      {Array.isArray(data.pain?.areas) && data.pain.areas.length > 0 && (
        <div style={{ ...styles.itemCard(COLORS.coralLight), marginBottom: "8px" }}>
          <div>
            <strong>Pain:</strong> {(Array.isArray(data.pain?.areas) ? data.pain.areas : []).map(id => {
              const r = ALL_BODY_REGIONS.find(x => x.id === id);
              const d = data.pain.areaDetails?.[id];
              return r ? `${r.label}${d?.scale ? ` (${d.scale}/10)` : ""}` : id;
            }).join(", ")}
          </div>
        </div>
      )}
      {(!Array.isArray(data.pain?.areas) || !data.pain.areas.length) && (
        <div style={{ ...styles.itemCard(COLORS.tealLight), marginBottom: "8px" }}><div><strong>Pain:</strong> None today 👍</div></div>
      )}
      {data.digestion?.bowelMovement && (
        <div style={{ ...styles.itemCard(COLORS.yellowLight), marginBottom: "8px" }}>
          <div>
            <strong>Bowel movement:</strong> {data.digestion.bowelMovement === "yes" ? "Yes ✓" : "No"}
            {Array.isArray(data.digestion.issues) && data.digestion.issues.length > 0 && data.digestion.issues[0] !== "all_good" && (
              <span> · <strong>Issues:</strong> {data.digestion.issues.join(", ")}</span>
            )}
            {data.digestion.note && <span> — "{data.digestion.note}"</span>}
          </div>
        </div>
      )}
      {data.sleep?.scale > 0 && (
        <div style={{ ...styles.itemCard(COLORS.tealLight) }}>
          <div>
            <strong>Sleep:</strong> {data.sleep.scale}/10
            {data.sleep.hours && ` · ${data.sleep.hours}h`}
            {data.sleep.wakeFeeling && ` · Woke feeling: ${data.sleep.wakeFeeling}`}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Monthly Calendar ─────────────────────────────────────────
const MOOD_QUADRANT_COLOR = {
  happy: "#52BC75", excited: "#52BC75", calm: "#52BC75",
  tired: "#78B4E8", lonely: "#78B4E8", sad: "#78B4E8",
  angry: "#E06060", scared: "#E06060", frustrated: "#E06060",
  worried: "#F0C840", nervous: "#F0C840", anxious: "#F0C840",
};

function CheckInCalendar({ patient, onBack }) {
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [dayData, setDayData]   = useState({});
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    const days = new Date(year, month + 1, 0).getDate();
    const promises = Array.from({ length: days }, (_, i) => {
      const d = i + 1;
      const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
      return window.storage.get(`checkin_v2:${patient}:${dateStr}`)
        .then(r => [dateStr, r ? JSON.parse(r.value) : null])
        .catch(() => [dateStr, null]);
    });
    Promise.all(promises)
      .then(results => {
        const map = {};
        results.forEach(([date, val]) => { if (val) map[date] = val; });
        setDayData(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [patient, year, month]);

  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const firstWeekDay = new Date(year, month, 1).getDay(); // 0=Sun
  const MONTH_NAMES  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_LABELS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const getDayColor = (dateStr) => {
    const d = dayData[dateStr];
    if (!d) return null;
    const moods = Array.isArray(d.mood?.selected) ? d.mood.selected : [];
    if (!moods.length) return COLORS.tealLight;
    // Use the first mood for color
    return MOOD_QUADRANT_COLOR[moods[0]] || COLORS.tealLight;
  };

  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11); } else setMonth(m => m-1); setSelected(null); };
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0); } else setMonth(m => m+1); setSelected(null); };

  const selData = selected ? dayData[selected] : null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button onClick={onBack} style={{ ...styles.btn("secondary") }}>← Back to check-in</button>
        <h2 style={{ margin: 0, fontSize: "18px", color: COLORS.navy }}>Check-in History</h2>
      </div>

      {/* Month nav */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <button onClick={prevMonth} style={{ ...styles.btn("secondary"), padding: "6px 14px" }}>‹</button>
        <div style={{ fontWeight: "bold", fontSize: "16px", color: COLORS.navy }}>{MONTH_NAMES[month]} {year}</div>
        <button onClick={nextMonth} style={{ ...styles.btn("secondary"), padding: "6px 14px" }} disabled={year === now.getFullYear() && month === now.getMonth()}>›</button>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "14px", justifyContent: "center" }}>
        {[["#52BC75","Happy/Calm"],["#78B4E8","Sad/Tired"],["#E06060","Angry/Scared"],["#F0C840","Worried/Frustrated"],["#E8E0D8","No check-in"]].map(([color, label]) => (
          <div key={label} style={{ display: "flex", gap: "5px", alignItems: "center", fontSize: "12px", color: COLORS.muted }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: color }}/>
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ ...styles.card, padding: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
          {DAY_LABELS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: "11px", color: COLORS.muted, fontWeight: "bold", padding: "4px 0" }}>{d}</div>
          ))}
        </div>
        {loading ? (
          <div style={styles.emptyState}>Loading...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
            {Array.from({ length: firstWeekDay }, (_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const color = getDayColor(dateStr);
              const hasData = !!dayData[dateStr];
              const isToday = dateStr === now.toISOString().split("T")[0];
              const isSel = selected === dateStr;
              return (
                <div
                  key={day}
                  onClick={() => hasData && setSelected(isSel ? null : dateStr)}
                  style={{
                    aspectRatio: "1", borderRadius: "8px", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    background: color || (isToday ? COLORS.tealLight : "#F8F4F0"),
                    border: isSel ? `2px solid ${COLORS.teal}` : isToday ? `2px solid ${COLORS.teal}44` : "2px solid transparent",
                    cursor: hasData ? "pointer" : "default",
                    fontSize: "12px", fontWeight: isToday ? "bold" : "normal",
                    color: color ? "#fff" : COLORS.muted,
                    transition: "all 0.1s",
                    boxShadow: isSel ? `0 2px 8px rgba(42,123,111,0.2)` : "none",
                  }}
                >
                  {day}
                  {hasData && (
                    <div style={{ position: "absolute", bottom: "2px", width: "4px", height: "4px", borderRadius: "50%", background: "rgba(255,255,255,0.7)" }}/>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected day detail */}
      {selData && (
        <div style={{ ...styles.card, marginTop: "16px" }}>
          <div style={{ fontWeight: "bold", color: COLORS.navy, marginBottom: "12px" }}>
            {new Date(selected + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </div>
          <CheckInSummaryV2 data={selData} />
        </div>
      )}

      {/* Stats */}
      {!loading && (
        <div style={{ ...styles.card, marginTop: "16px" }}>
          <div style={styles.sectionTitle}>Month at a glance</div>
          <div style={styles.statRow}>
            <div style={styles.stat(COLORS.tealLight)}>
              <div style={styles.statNum}>{Object.keys(dayData).length}</div>
              <div style={styles.statLabel}>Check-ins</div>
            </div>
            <div style={styles.stat(COLORS.tealLight)}>
              <div style={styles.statNum}>{daysInMonth}</div>
              <div style={styles.statLabel}>Days in month</div>
            </div>
            <div style={styles.stat(COLORS.yellowLight)}>
              <div style={styles.statNum}>
                {Object.keys(dayData).length > 0
                  ? Math.round((Object.values(dayData).reduce((sum, d) => sum + (d.sleep?.scale || 0), 0) / Object.keys(dayData).length) * 10) / 10 || "—"
                  : "—"}
              </div>
              <div style={styles.statLabel}>Avg sleep</div>
            </div>
          </div>
          {/* Most common mood */}
          {(() => {
            const moodCount = {};
            Object.values(dayData).forEach(d => {
              (Array.isArray(d.mood?.selected) ? d.mood.selected : []).forEach(m => { moodCount[m] = (moodCount[m] || 0) + 1; });
            });
            const top = Object.entries(moodCount).sort((a,b) => b[1]-a[1])[0];
            if (!top) return null;
            const e = WHEEL_EMOTIONS.find(w => w.id === top[0]);
            return (
              <div style={{ fontSize: "13px", color: COLORS.muted, marginTop: "8px" }}>
                Most common mood: <strong style={{ color: COLORS.navy }}>{e?.label || top[0]}</strong> ({top[1]} day{top[1] !== 1 ? "s" : ""})
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
