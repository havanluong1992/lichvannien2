// DOM Elements
const monthYearDisplay = document.getElementById('current-month-year');
const daysContainer = document.getElementById('calendar-days');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const todayBtn = document.getElementById('today-btn');

// Detail Panel Elements
const dSolarDay = document.getElementById('detail-solar-day');
const dSolarMonth = document.getElementById('detail-solar-month');
const dSolarYear = document.getElementById('detail-solar-year');
const dLunarDay = document.getElementById('detail-lunar-day');
const dLunarMonthYear = document.getElementById('detail-lunar-month-year');
const dCanChiDay = document.getElementById('detail-canchi-day');
const dCanChiMonth = document.getElementById('detail-canchi-month');
const dLuckyHours = document.getElementById('detail-lucky-hours');
const holidayInfoDisplay = document.getElementById('holiday-info');
const quoteText = document.getElementById('quote-text');

let currentDate = new Date();
let selectedDate = new Date();

const QUOTES = [
    "Ngọc bất trác bất thành khí, nhân bất học bất tri lý.",
    "Hành trình vạn dặm bắt đầu từ một bước chân.",
    "Có công mài sắt, có ngày nên kim.",
    "Dục tốc bất đạt.",
    "Tiên học lễ, hậu học văn.",
    "Một chữ cũng là thầy, nửa chữ cũng là thầy.",
    "Ăn quả nhớ kẻ trồng cây."
];

const SOLAR_HOLIDAYS = {
    "1-1": "Tết Dương lịch",
    "14-2": "Lễ Tình nhân",
    "8-3": "Quốc tế Phụ nữ",
    "30-4": "Giải phóng Miền Nam",
    "1-5": "Quốc tế Lao động",
    "19-5": "Sinh nhật Bác Hồ",
    "1-6": "Quốc tế Thiếu nhi",
    "2-9": "Quốc khánh",
    "3-9": "Quốc khánh",
    "20-10": "Phụ nữ Việt Nam",
    "20-11": "Nhà giáo Việt Nam",
    "22-12": "Quân đội nhân dân",
    "24-12": "Giáng sinh"
};

const LUNAR_HOLIDAYS = {
    "1-1": "Tết Nguyên Đán",
    "2-1": "Tết Nguyên Đán",
    "3-1": "Tết Nguyên Đán",
    "4-1": "Tết Nguyên Đán",
    "5-1": "Tết Nguyên Đán",
    "15-1": "Rằm tháng Giêng",
    "3-3": "Tết Hàn thực",
    "10-3": "Giỗ Tổ Hùng Vương",
    "15-4": "Lễ Phật đản",
    "5-5": "Tết Đoan ngọ",
    "15-7": "Lễ Vu lan",
    "15-8": "Tết Trung thu",
    "23-12": "Ông Táo chầu trời"
};

function getHoliday(d, m, lunarD, lunarM) {
    const solarKey = `${d}-${m}`;
    const lunarKey = `${lunarD}-${lunarM}`;
    return SOLAR_HOLIDAYS[solarKey] || LUNAR_HOLIDAYS[lunarKey] || null;
}

function init() {
    renderCalendar(currentDate);
    updateDetails(selectedDate);

    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });

    todayBtn.addEventListener('click', () => {
        currentDate = new Date();
        selectedDate = new Date();
        renderCalendar(currentDate);
        updateDetails(selectedDate);
    });
}

function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    monthYearDisplay.textContent = `Tháng ${String(month + 1).padStart(2, '0')} - ${year}`;

    daysContainer.innerHTML = '';

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth; i > 0; i--) {
        const d = prevMonthLastDay - i + 1;
        createDayCell(d, month - 1, year, true);
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        createDayCell(i, month, year, false);
    }

    // Fill next month days
    const totalCells = 42;
    const remainingCells = totalCells - (firstDayOfMonth + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
        createDayCell(i, month + 1, year, true);
    }
}

function createDayCell(day, month, year, isDifferentMonth) {
    const cellDate = new Date(year, month, day);
    const d = cellDate.getDate();
    const m = cellDate.getMonth() + 1;
    const y = cellDate.getFullYear();

    const cell = document.createElement('div');
    cell.className = 'day-cell';
    if (isDifferentMonth) cell.classList.add('different-month');

    const today = new Date();
    if (d === today.getDate() && cellDate.getMonth() === today.getMonth() && y === today.getFullYear()) {
        cell.classList.add('today');
    }

    if (d === selectedDate.getDate() && cellDate.getMonth() === selectedDate.getMonth() && y === selectedDate.getFullYear()) {
        cell.classList.add('selected');
    }

    const lunar = convertSolar2Lunar(d, m, y, 7);
    const holiday = getHoliday(d, m, lunar.day, lunar.month);

    let lunarContent = lunar.day;
    if (lunar.day === 1 || lunar.day === 15) {
        lunarContent = lunar.day === 1 ? `${lunar.day}/${lunar.month}${lunar.leap ? 'n' : ''}` : lunar.day;
        cell.classList.add('special-day');
    }

    if (holiday) {
        cell.classList.add('holiday-cell');
    }

    cell.innerHTML = `
        <span class="solar-num">${d}</span>
        <span class="lunar-num">${lunarContent}</span>
        ${holiday ? `<span class="holiday-label">${holiday}</span>` : ''}
    `;

    cell.addEventListener('click', () => {
        selectedDate = new Date(year, month, day);
        updateDetails(selectedDate);
        renderCalendar(currentDate);
    });

    daysContainer.appendChild(cell);
}

function updateDetails(date) {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    const jd = getJulianDay(d, m, y);
    const lunar = convertSolar2Lunar(d, m, y, 7);

    dSolarDay.textContent = d;
    dSolarMonth.textContent = `Tháng ${m}`;
    dSolarYear.textContent = y;

    dLunarDay.textContent = lunar.day;
    if (lunar.day === 1 || lunar.day === 15) {
        dLunarDay.classList.add('special-lunar');
    } else {
        dLunarDay.classList.remove('special-lunar');
    }
    const canChiYear = getCanChiYear(lunar.year);
    const leapText = lunar.leap ? " (nhuận)" : "";
    dLunarMonthYear.textContent = `Tháng ${lunar.month}${leapText}, năm ${canChiYear}`;

    const holiday = getHoliday(d, m, lunar.day, lunar.month);
    if (holiday) {
        holidayInfoDisplay.textContent = holiday;
        holidayInfoDisplay.style.display = 'block';
    } else {
        holidayInfoDisplay.style.display = 'none';
    }

    dCanChiDay.textContent = getCanChiDay(jd);
    dCanChiMonth.textContent = getCanChiMonth(lunar.month, lunar.year);
    dLuckyHours.textContent = getLuckyHours(jd);

    // Update quote
    quoteText.textContent = `"${QUOTES[jd % QUOTES.length]}"`;
}

init();
