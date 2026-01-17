/**
 * Vietnamese Lunar Calendar Calculation Algorithm
 * Source: Ho Ngoc Duc (amlich-hnd.js)
 * Ported to a cleaner JavaScript implementation.
 */

const TIMEZONE = 7;

function getJulianDay(d, m, y) {
    let a = Math.floor((14 - m) / 12);
    y = y + 4800 - a;
    m = m + 12 * a - 3;
    return d + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

function decodeJulianDay(jd) {
    let b = 0, c = 0, d = 0, e = 0, f = 0;
    if (jd > 2299160) {
        let alpha = Math.floor((jd - 1867216.25) / 36524.25);
        jd += 1 + alpha - Math.floor(alpha / 4);
    }
    b = jd + 1524;
    c = Math.floor((b - 122.1) / 365.25);
    d = Math.floor(365.25 * c);
    e = Math.floor((b - d) / 30.6001);
    let day = b - d - Math.floor(30.6001 * e);
    let month = (e < 14) ? e - 1 : e - 13;
    let year = (month > 2) ? c - 4716 : c - 4715;
    return { day, month, year };
}

function NewMoon(k) {
    let T = k / 1236.85;
    let T2 = T * T;
    let T3 = T2 * T;
    let dr = Math.PI / 180;
    let Jd = 2451550.09765 + 29.530588853 * k + 0.0001337 * T2 - 0.000000150 * T3 + 0.00073 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    let M = (2.5534 + 29.10535669 * k - 0.0000218 * T2 - 0.00000011 * T3) * dr;
    let Mprime = (201.5643 + 385.81693528 * k + 0.0107438 * T2 + 0.00001239 * T3) * dr;
    let F = (160.7108 + 390.67050274 * k - 0.0016341 * T2 - 0.00000227 * T3) * dr;
    let Dsplit = Jd + (0.1734 - 0.000393 * T) * Math.sin(M) + 0.0021 * Math.sin(2 * M) - 0.4068 * Math.sin(Mprime) + 0.0161 * Math.sin(2 * Mprime) - 0.0004 * Math.sin(3 * Mprime) + 0.0104 * Math.sin(2 * F) - 0.0051 * Math.sin(M + Mprime) - 0.0074 * Math.sin(M - Mprime);
    return Dsplit;
}

function SunLongitude(jdn) {
    let T = (jdn - 2451545.0) / 36525.0;
    let T2 = T * T;
    let dr = Math.PI / 180;
    let M = (357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T2 * T) * dr;
    let C = ((1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000290 * Math.sin(3 * M)) * dr;
    let L = (280.46645 + 36000.76983 * T + 0.0003032 * T2) * dr;
    return (L + C);
}

function getNewMoonDay(k, timezone) {
    return Math.floor(NewMoon(k) + timezone / 24 + 0.00001);
}

function getSunLongitude(jdn, timezone) {
    return Math.floor(SunLongitude(jdn + 0.5 - timezone / 24) * 6 / Math.PI);
}

function getLunarMonth11(yy, timezone) {
    let off = getJulianDay(31, 12, yy) - 2451545;
    let k = Math.floor(off / 29.530588853);
    let nm = getNewMoonDay(k, timezone);
    let sunLong = getSunLongitude(nm, timezone);
    if (sunLong >= 9) nm = getNewMoonDay(k - 1, timezone);
    return nm;
}

function getLeapMonthOffset(nm11, nm11next, timezone) {
    let k = Math.floor((nm11 - 2451545) / 29.530588853 + 0.5);
    let last = getSunLongitude(nm11, timezone);
    for (let i = 1; i <= 12; i++) {
        let nm = getNewMoonDay(k + i, timezone);
        let current = getSunLongitude(nm, timezone);
        if (current === last) return i;
        last = current;
    }
    return 0;
}

function convertSolar2Lunar(dd, mm, yy, timezone) {
    let jdn = getJulianDay(dd, mm, yy);
    let k = Math.floor((jdn - 2451550.1) / 29.530588853);
    let nm = getNewMoonDay(k, timezone);
    if (nm > jdn) nm = getNewMoonDay(--k, timezone);
    let day = jdn - nm + 1;
    let month, year, leap = 0;

    let nm11 = getLunarMonth11(yy, timezone);
    if (nm11 > jdn) {
        nm11 = getLunarMonth11(yy - 1, timezone);
    }

    let nm11next = getLunarMonth11(yy + 1, timezone);
    if (nm11next <= jdn) {
        nm11 = nm11next;
        nm11next = getLunarMonth11(yy + 2, timezone);
    }

    let diff = Math.floor((nm - nm11) / 29.530588853 + 0.5);
    let leapMonth = 0;
    let hasLeap = Math.floor((nm11next - nm11) / 29.530588853 + 0.5) === 13;

    if (hasLeap) {
        leapMonth = getLeapMonthOffset(nm11, nm11next, timezone);
    }

    if (hasLeap && diff >= leapMonth) {
        if (diff === leapMonth) leap = 1;
        month = (diff + 10) % 12 + 1;
        if (diff > leapMonth) month = (diff + 9) % 12 + 1;
    } else {
        month = (diff + 10) % 12 + 1;
    }

    // Calculate Year
    let ly = yy;
    if (month >= 11 && diff <= 2) ly = yy - 1;
    // Final correction for months near Tet
    if (month >= 11 && nm < nm11) ly = yy - 1; // Not really possible but for safety

    // Actually, the year is dependent on the month 1
    // If month is 1, 2... and it's around Feb solar, it's yy.
    // If month is 11, 12 and it's Jan solar, it's yy-1.
    year = ly;
    if (month > 10 && mm === 1) year = yy - 1;
    else if (month < 3 && mm === 12) year = yy + 1;

    return { day, month, year, leap };
}

const CAN = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
const CHI = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];

function getCanChiYear(year) {
    return CAN[(year + 6) % 10] + " " + CHI[(year + 8) % 12];
}

function getCanChiMonth(month, year) {
    // Can của tháng dựa vào năm
    let can = CAN[(year * 12 + month + 3) % 10];
    let chi = CHI[(month + 1) % 12];
    return can + " " + chi;
}

function getCanChiDay(jd) {
    return CAN[(jd + 9) % 10] + " " + CHI[(jd + 1) % 12];
}

function getLuckyHours(jd) {
    let chiIndex = (jd + 1) % 12;
    const luckyMap = [
        "Tý, Sửu, Mão, Ngọ, Thân, Dậu", // Tý
        "Dần, Mão, Tỵ, Thân, Tuất, Hợi", // Sửu
        "Tý, Sửu, Thìn, Tỵ, Mùi, Tuất", // Dần
        "Tý, Dần, Mão, Ngọ, Mùi, Dậu", // Mão
        "Dần, Thìn, Tỵ, Thân, Dậu, Hợi", // Thìn
        "Sửu, Thìn, Ngọ, Mùi, Tuất, Hợi", // Tỵ
        "Tý, Sửu, Mão, Ngọ, Thân, Dậu", // Ngọ
        "Dần, Mão, Tỵ, Thân, Tuất, Hợi", // Mùi
        "Tý, Sửu, Thìn, Tỵ, Mùi, Tuất", // Thân
        "Tý, Dần, Mão, Ngọ, Mùi, Dậu", // Dậu
        "Dần, Thìn, Tỵ, Thân, Dậu, Hợi", // Tuất
        "Sửu, Thìn, Ngọ, Mùi, Tuất, Hợi"  // Hợi
    ];
    return luckyMap[chiIndex];
}
module.exports = { convertSolar2Lunar };
