import { NextResponse } from "next/server";

export async function GET(request) {
  // ================= INPUT =================
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("n");

  if (!raw) {
    return NextResponse.json({
      ok: false,
      error: "number parameter missing",
    });
  }

  // only digits
  const number = raw.replace(/\D/g, "");
  let finalNumber = null;

  // ================= COUNTRY AUTO DETECT =================
  /*
   BD Rules:
    - 10 digit (without 0)  -> 880XXXXXXXXXX
    - 11 digit (starting 0)-> 880XXXXXXXXXX
  */

  if (number.length === 10) {
    // Could be BD (no 0) OR IN
    // BD operator always starts with 1
    if (number[0] === "1") {
      finalNumber = "880" + number; // Bangladesh
    } else {
      finalNumber = "91" + number; // India
    }
  } else if (number.length === 11 && number[0] === "0") {
    // Bangladesh with leading 0
    finalNumber = "88" + number;
  } else if (number.length === 12 && number.startsWith("91")) {
    // already India format
    finalNumber = number;
  } else if (number.length === 13 && number.startsWith("880")) {
    // already Bangladesh format
    finalNumber = number;
  }

  if (!finalNumber) {
    return NextResponse.json({
      ok: false,
      error: "invalid BD or IN number",
    });
  }

  // ================= CONFIG =================
  const MAIN_API =
    "https://prod-api.telebothost.com/ownlang/webapp/64472422/api";
  const API_KEY =
    "truecallerinfolookupbot-5556909453-IR2s3K";

  // ================= API CALL =================
  const url = `${MAIN_API}?number=+${finalNumber}&key=${API_KEY}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();

    // ================= OUTPUT =================
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: "curl request failed",
    });
  }
} 
