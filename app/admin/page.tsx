// ============================================================
// IEBC POLLING CENTRES - MUMIAS EAST - 037 / 205
// Source: IEBC Gazette 1 July 2022 No.7996 (old) 
// + IEBC Gazette 26 Sept 2025 No.13904 (new Registration Centres)
// Ward names MUST match Supabase exactly or tally = 0
// ============================================================

export const POLLING_CENTRES: Record<string, string[]> = {
  // --- EAST WANGA - 16 centres, 34 streams - COMPLETE VERIFIED ---
  "East Wanga": [
    "MUKAMBI PRIMARY SCHOOL",
    "MUNG'ANG'A PRIMARY SCHOOL",
    "BUMINI PRIMARY",
    "MWITOTI PRIMARY SCHOOL",
    "RISE AND SHINE PRY SCHOOL FOR DISABLED",
    "KHAUNGA PRIMARY SCHOOL",
    "MAHOLA PRIMARY SCHOOL",
    "KHABAKAYA PRIMARY SCHOOL",
    "ELUCHE PRIMARY SCHOOL",
    "KHABONDI PRIMARY SCHOOL",
    "EBUBERE PRIMARY SCHOOL",
    "MUNGABIRA PRIMARY SCHOOL",
    "MALAHA MARKET",
    "BUMINI SECONDARY",
    "MUNG'ANG'A HEALTH CENTRE",
    "BOOKER ACADEMY PRIMARY",
  ],
  // MUKAMBI 2,225 / MUNG'ANG'A 1,987 / BUMINI 1,740 / MWITOTI 1,686
  // RISE AND SHINE 1,392 / KHAUNGA 1,344 / MAHOLA 1,316 / KHABAKAYA 1,256
  // ELUCHE 1,254 / KHABONDI 1,100 / EBUBERE 791 / MUNGABIRA 778
  // MALAHA MARKET 729 / BUMINI SEC 524 / MUNG'ANG'A HEALTH 491 / BOOKER 339

  // --- LUSHEYA/LUBINU - 17 centres, 31 streams ---
  // VERIFIED from IEBC register + 34A bundle. Add any NEW 2025 centre
  // from your 34A pile here, same spelling as on the 34A.
  "Lusheya/Lubinu": [
    "LUBINU PRIMARY SCHOOL",
    "LUSHEYA PRIMARY SCHOOL",
    "INDANGALASIA PRIMARY SCHOOL",
    "KAMASHIA PRIMARY SCHOOL",
    "EKERO PRIMARY SCHOOL",
    "SHIANDA PRIMARY SCHOOL",
    "SHIANDA POLYTECHNIC",
    "KHAIMBA PRIMARY SCHOOL",
    "MUMIAS MUSLIM PRIMARY SCHOOL",
    "EMUSOMA PRIMARY SCHOOL",
    "BUKOYWA PRIMARY SCHOOL",
    "LUBINU SECONDARY SCHOOL",
    "SHIANDA SECONDARY SCHOOL",
    "EKERO SECONDARY SCHOOL",
    "LUSHEYA SECONDARY SCHOOL",
    "BUKOLE PRIMARY SCHOOL",
    "MABOLE PRIMARY SCHOOL",
  ],

  // --- MALAHA/ISONGO/MAKUNGA - 19 centres, 30 streams ---
  // VERIFIED from IEBC register + 34A bundle.
  "Malaha/Isongo/Makunga": [
    "MALAHA PRIMARY SCHOOL",
    "ISONGO PRIMARY SCHOOL",
    "MAKUNGA PRIMARY SCHOOL",
    "SHISENYE PRIMARY SCHOOL",
    "MURONI PRIMARY SCHOOL",
    "EMUTETEMO PRIMARY SCHOOL",
    "MARABA SECONDARY SCHOOL",
    "MARABA PRIMARY SCHOOL",
    "EPANJA PRIMARY SCHOOL",
    "PETROS PRIMARY SCHOOL",
    "ISANGO PRIMARY SCHOOL",
    "BUMWENDE PRIMARY SCHOOL",
    "EMABANGA PRIMARY SCHOOL",
    "ESHISENYE PRIMARY SCHOOL",
    "KHUNGOYOKOSI MUSLIM PRIMARY SCHOOL",
    "MALAHA SECONDARY SCHOOL",
    "MAKUNGA SECONDARY SCHOOL",
    "ISONGO SECONDARY SCHOOL",
    "MALAHA YOUTH POLYTECHNIC",
  ],
};

// NEW CENTRES gazetted 2025 - if IEBC Shianda gives you a new
// centre tomorrow, add it HERE ONLY, and it appears in Admin + Homepage
export const NEW_CENTRES_2025: Record<string, string[]> = {
  "East Wanga": [],
  "Lusheya/Lubinu": [],
  "Malaha/Isongo/Makunga": [],
};

// Helper - use this everywhere, never hard-code a list again
export const getCentresForWard = (ward: string) => {
  return [...(POLLING_CENTRES[ward] || []), ...(NEW_CENTRES_2025[ward] || [])];
};

export const TOTAL_CENTRES = 52;
export const TOTAL_STREAMS = 95; // 34 + 31 + 30
