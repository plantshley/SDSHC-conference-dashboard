// Dashboard JavaScript - SD Soil Health Coalition Conference Analysis

// Color scheme matching CSS
const COLORS = {
    primary: '#2D5016',
    accent: '#6B8E23',
    orange: '#CC7722',
    brown: '#5D4E37',
    tan: '#F5DEB3',
    yellow: '#FFD700',
    paleGreen: '#9ACD32',
    darkGreen: '#1a3a0f',
    blue: '#4A90E2',
    purple: '#8E44AD',
    red: '#E74C3C'
};

// Chart.js default configuration
Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
Chart.defaults.color = '#3E2723';
Chart.defaults.plugins.legend.display = true;
Chart.defaults.plugins.legend.position = 'bottom';

// Data storage
let surveyData = [];

// Navigation
document.addEventListener('DOMContentLoaded', () => {
    // Setup navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            showSection(section);
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Load and process data
    loadData();
});

function showSection(sectionId) {
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Load CSV data
async function loadData() {
    try {
        const response = await fetch('soil_health_survey_enhanced.csv');
        const csvText = await response.text();
        surveyData = parseCSV(csvText);
        initializeCharts();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Parse CSV
function parseCSV(csv) {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        // Simple CSV parsing (handles quoted fields)
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let char of line) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim().replace(/^"|"$/g, ''));

        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            data.push(row);
        }
    }

    return data;
}

// Initialize all charts
function initializeCharts() {
    createAttendanceChart();
    createSatisfactionByYearChart();
    createKnowledgeByYearChart();
    createAttendeeTypeDonutChart();
    createAttendeeTypeYearChart();
    createAttendeeTypeTrendChart();
    createImplementationChart();
    createImplementationByTypeChart();
    createSatisfactionDistributionChart();
    createKnowledgeDistributionChart();
    createSatisfactionKnowledgeScatter();
    createTopicPopularityChart();
    createTopicTrendChart();
    createTopicByTypeChart();
    createEmergingTopicsChart();
    createTechnicianInterestChart();
    createTechnicianByTypeChart();
    createTechnicianImplementationChart();
}

// Chart 1: Attendance Over Time
function createAttendanceChart() {
    // Actual ticket registration data from PDF
    const actualAttendance = {
        '2022': 251,
        '2023': 254,
        '2024': 307,
        '2025': 391
    };

    const yearCounts = {};
    surveyData.forEach(row => {
        const year = row.year;
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    const years = Object.keys(yearCounts).sort();

    const ctx = document.getElementById('attendanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [{
                label: 'Ticket Registrations (Actual Attendance)',
                data: years.map(y => actualAttendance[y]),
                borderColor: COLORS.primary,
                backgroundColor: 'rgba(45, 80, 22, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 8,
                pointBackgroundColor: COLORS.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                yAxisID: 'y'
            }, {
                label: 'Survey Responses',
                data: years.map(y => yearCounts[y]),
                borderColor: COLORS.orange,
                backgroundColor: 'rgba(204, 119, 34, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: COLORS.orange,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                yAxisID: 'y'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Note: Ticket registrations may not include walk-ins, students, or youth attendees',
                    font: { size: 11, style: 'italic' }
                },
                datalabels: {
                    display: true,
                    align: 'top',
                    formatter: (value) => value,
                    font: { weight: 'bold', size: 11 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 50 },
                    title: { display: true, text: 'Number of Attendees' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Chart 2: Satisfaction by Year
function createSatisfactionByYearChart() {
    const yearSatisfaction = {};

    surveyData.forEach(row => {
        const year = row.year;
        const rating = parseFloat(row.Satisfaction_Rating);
        if (!isNaN(rating)) {
            if (!yearSatisfaction[year]) yearSatisfaction[year] = [];
            yearSatisfaction[year].push(rating);
        }
    });

    const avgByYear = {};
    Object.keys(yearSatisfaction).forEach(year => {
        const ratings = yearSatisfaction[year];
        avgByYear[year] = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    });

    const ctx = document.getElementById('satisfactionYearChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(avgByYear).sort(),
            datasets: [{
                label: 'Average Satisfaction Rating',
                data: Object.keys(avgByYear).sort().map(y => avgByYear[y].toFixed(2)),
                backgroundColor: COLORS.accent,
                borderColor: COLORS.primary,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 4,
                    ticks: { stepSize: 0.5 }
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value,
                    font: { weight: 'bold', size: 12 }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Chart 3: Knowledge Gain by Year
function createKnowledgeByYearChart() {
    const yearKnowledge = {};

    surveyData.forEach(row => {
        const year = row.year;
        const rating = parseFloat(row.Knowledge_Gain_Rating);
        if (!isNaN(rating)) {
            if (!yearKnowledge[year]) yearKnowledge[year] = [];
            yearKnowledge[year].push(rating);
        }
    });

    const avgByYear = {};
    Object.keys(yearKnowledge).forEach(year => {
        const ratings = yearKnowledge[year];
        avgByYear[year] = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    });

    const ctx = document.getElementById('knowledgeYearChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(avgByYear).sort(),
            datasets: [{
                label: 'Average Knowledge Gain Rating',
                data: Object.keys(avgByYear).sort().map(y => avgByYear[y].toFixed(2)),
                backgroundColor: COLORS.orange,
                borderColor: COLORS.brown,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    ticks: { stepSize: 0.5 }
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value,
                    font: { weight: 'bold', size: 12 }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Chart 4: Attendee Type Donut
function createAttendeeTypeDonutChart() {
    const typeCounts = {};
    surveyData.forEach(row => {
        const type = row.Attendee_Type_Category || 'Unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const sortedTypes = Object.entries(typeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    const colors = [COLORS.primary, COLORS.accent, COLORS.orange, COLORS.brown,
                    COLORS.blue, COLORS.purple, COLORS.paleGreen, COLORS.tan];

    const ctx = document.getElementById('attendeeTypeDonut').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: sortedTypes.map(t => t[0]),
            datasets: [{
                data: sortedTypes.map(t => t[1]),
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'right' },
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 11 },
                    formatter: (value, ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(0);
                        return percentage + '%';
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Chart 5: Attendee Type by Year
function createAttendeeTypeYearChart() {
    const yearTypeData = {};

    surveyData.forEach(row => {
        const year = row.year;
        const type = row.Attendee_Type_Category || 'Unknown';
        if (!yearTypeData[year]) yearTypeData[year] = {};
        yearTypeData[year][type] = (yearTypeData[year][type] || 0) + 1;
    });

    const years = Object.keys(yearTypeData).sort();
    const allTypes = [...new Set(surveyData.map(r => r.Attendee_Type_Category))];
    const topTypes = allTypes.slice(0, 6);

    const datasets = topTypes.map((type, idx) => ({
        label: type,
        data: years.map(year => yearTypeData[year][type] || 0),
        backgroundColor: [COLORS.primary, COLORS.accent, COLORS.orange,
                         COLORS.brown, COLORS.blue, COLORS.purple][idx]
    }));

    const ctx = document.getElementById('attendeeTypeYearChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            }
        }
    });
}

// Chart 6: Attendee Type Trends
function createAttendeeTypeTrendChart() {
    const yearTypeData = {};

    surveyData.forEach(row => {
        const year = row.year;
        const type = row.Attendee_Type_Category || 'Unknown';
        if (!yearTypeData[year]) yearTypeData[year] = {};
        yearTypeData[year][type] = (yearTypeData[year][type] || 0) + 1;
    });

    const years = Object.keys(yearTypeData).sort();
    const topTypes = ['Agricultural Producers', 'Conservation Professionals',
                      'Students & Educators', 'Land Managers & Owners'];

    const datasets = topTypes.map((type, idx) => ({
        label: type,
        data: years.map(year => yearTypeData[year][type] || 0),
        borderColor: [COLORS.primary, COLORS.accent, COLORS.orange, COLORS.brown][idx],
        backgroundColor: [COLORS.primary, COLORS.accent, COLORS.orange, COLORS.brown][idx] + '33',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 5
    }));

    const ctx = document.getElementById('attendeeTypeTrendChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Chart 7: Implementation Likelihood
function createImplementationChart() {
    const likelihoodCounts = {};
    surveyData.forEach(row => {
        const likelihood = row['How.likely.are.you.to.use.the.information.learned.at.the.conference.to.change.or.fine.tune.current.practices.on.your.farm..ranch.or.property.'];
        if (likelihood && likelihood !== 'Not Applicable') {
            likelihoodCounts[likelihood] = (likelihoodCounts[likelihood] || 0) + 1;
        }
    });

    const order = ['Very Likely', 'Likely', 'Unlikely'];
    const orderedData = order.map(l => likelihoodCounts[l] || 0);
    const colors = [COLORS.primary, COLORS.accent, COLORS.red];

    const ctx = document.getElementById('implementationChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: order,
            datasets: [{
                data: orderedData,
                backgroundColor: colors,
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value, ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(0);
                        return value + '\n(' + percentage + '%)';
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Chart 8: Implementation by Attendee Type
function createImplementationByTypeChart() {
    const typeImplementation = {};

    surveyData.forEach(row => {
        const type = row.Attendee_Type_Category;
        const score = parseFloat(row.Likelihood_Score);
        if (type && !isNaN(score)) {
            if (!typeImplementation[type]) typeImplementation[type] = [];
            typeImplementation[type].push(score);
        }
    });

    const avgByType = {};
    Object.keys(typeImplementation).forEach(type => {
        const scores = typeImplementation[type];
        avgByType[type] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    const sortedTypes = Object.entries(avgByType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const ctx = document.getElementById('implementationByTypeChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedTypes.map(t => t[0]),
            datasets: [{
                label: 'Average Implementation Likelihood Score',
                data: sortedTypes.map(t => t[1].toFixed(2)),
                backgroundColor: COLORS.primary,
                borderColor: COLORS.accent,
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    beginAtZero: true,
                    max: 4
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    formatter: (value) => value,
                    font: { weight: 'bold' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Chart 9: Satisfaction Distribution
function createSatisfactionDistributionChart() {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    surveyData.forEach(row => {
        const rating = parseInt(row.Satisfaction_Rating);
        if (rating >= 1 && rating <= 5) {
            ratingCounts[rating]++;
        }
    });

    const ctx = document.getElementById('satisfactionDistChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
            datasets: [{
                label: 'Number of Responses',
                data: [ratingCounts[1], ratingCounts[2], ratingCounts[3],
                       ratingCounts[4], ratingCounts[5]],
                backgroundColor: [COLORS.red, COLORS.orange, COLORS.brown,
                                 COLORS.accent, COLORS.primary],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    font: { weight: 'bold', size: 12 }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Chart 10: Knowledge Gain Distribution
function createKnowledgeDistributionChart() {
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    surveyData.forEach(row => {
        const rating = parseInt(row.Knowledge_Gain_Rating);
        if (rating >= 1 && rating <= 4) {
            ratingCounts[rating]++;
        }
    });

    const ctx = document.getElementById('knowledgeDistChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4'],
            datasets: [{
                label: 'Number of Responses',
                data: [ratingCounts[1], ratingCounts[2], ratingCounts[3],
                       ratingCounts[4]],
                backgroundColor: [COLORS.red, COLORS.orange, COLORS.brown,
                                 COLORS.accent],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    font: { weight: 'bold', size: 12 }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Chart 11: Satisfaction vs Knowledge Scatter
function createSatisfactionKnowledgeScatter() {
    const dataPoints = surveyData
        .filter(row => row.Satisfaction_Rating && row.Knowledge_Gain_Rating)
        .map(row => ({
            x: parseFloat(row.Knowledge_Gain_Rating),
            y: parseFloat(row.Satisfaction_Rating)
        }))
        .filter(p => !isNaN(p.x) && !isNaN(p.y));

    const ctx = document.getElementById('satisfactionKnowledgeScatter').getContext('2d');
    new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Survey Responses',
                data: dataPoints,
                backgroundColor: COLORS.accent + '80',
                borderColor: COLORS.primary,
                borderWidth: 1,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                x: {
                    title: { display: true, text: 'Knowledge Gain Rating (1-4)' },
                    min: 0,
                    max: 4
                },
                y: {
                    title: { display: true, text: 'Satisfaction Rating (1-5)' },
                    min: 0,
                    max: 5
                }
            },
            plugins: {
                datalabels: { display: false }
            }
        }
    });
}

// Chart 12: Topic Popularity
function createTopicPopularityChart() {
    const topicCounts = {};

    surveyData.forEach(row => {
        const categories = row.Interest_Categories;
        if (categories && categories !== 'NA') {
            const topics = categories.split(';').map(t => t.trim());
            topics.forEach(topic => {
                if (topic) {
                    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                }
            });
        }
    });

    const sortedTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12);

    const ctx = document.getElementById('topicPopularityChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedTopics.map(t => t[0]),
            datasets: [{
                label: 'Mentions',
                data: sortedTopics.map(t => t[1]),
                backgroundColor: COLORS.accent,
                borderColor: COLORS.primary,
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    font: { weight: 'bold' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Chart 13: Topic Trends Over Time
function createTopicTrendChart() {
    const keyTopics = [
        'Livestock Integration & Grazing',
        'Cover Crops',
        'Carbon & Climate',
        'Soil Biology & Microbiology',
        'Regenerative & Organic Ag',
        'Economics & Financial'
    ];

    const yearTopicData = {};

    surveyData.forEach(row => {
        const year = row.year;
        const categories = row.Interest_Categories;
        if (categories && categories !== 'NA') {
            const topics = categories.split(';').map(t => t.trim());
            if (!yearTopicData[year]) yearTopicData[year] = {};
            topics.forEach(topic => {
                if (keyTopics.includes(topic)) {
                    yearTopicData[year][topic] = (yearTopicData[year][topic] || 0) + 1;
                }
            });
        }
    });

    const years = Object.keys(yearTopicData).sort();
    const colors = [COLORS.primary, COLORS.accent, COLORS.orange,
                    COLORS.brown, COLORS.blue, COLORS.purple];

    const datasets = keyTopics.map((topic, idx) => ({
        label: topic,
        data: years.map(year => yearTopicData[year][topic] || 0),
        borderColor: colors[idx],
        backgroundColor: colors[idx] + '33',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointRadius: 5
    }));

    const ctx = document.getElementById('topicTrendChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Chart 14: Topic Preferences by Type
function createTopicByTypeChart() {
    const attendeeTypes = ['Agricultural Producers', 'Conservation Professionals', 'Students & Educators'];
    const topTopics = ['Livestock Integration & Grazing', 'Cover Crops', 'Soil Biology & Microbiology',
                       'Economics & Financial', 'Carbon & Climate'];

    const typeTopicData = {};

    surveyData.forEach(row => {
        const type = row.Attendee_Type_Category;
        const categories = row.Interest_Categories;
        if (attendeeTypes.includes(type) && categories && categories !== 'NA') {
            if (!typeTopicData[type]) typeTopicData[type] = {};
            const topics = categories.split(';').map(t => t.trim());
            topics.forEach(topic => {
                if (topTopics.includes(topic)) {
                    typeTopicData[type][topic] = (typeTopicData[type][topic] || 0) + 1;
                }
            });
        }
    });

    const datasets = attendeeTypes.map((type, idx) => ({
        label: type,
        data: topTopics.map(topic => typeTopicData[type]?.[topic] || 0),
        backgroundColor: [COLORS.primary, COLORS.accent, COLORS.orange][idx],
        borderWidth: 2,
        borderColor: '#fff'
    }));

    const ctx = document.getElementById('topicByTypeChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topTopics.map(t => t.replace(' & ', '\n& ')),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Chart 15: Emerging Topics
function createEmergingTopicsChart() {
    const emergingTopics = [
        'Regenerative & Organic Ag',
        'Carbon & Climate',
        'Health Connections',
        'Diverse Cropping Systems',
        'Compost & Amendments'
    ];

    const recentYears = ['2024', '2025'];
    const topicCounts = {};

    emergingTopics.forEach(topic => topicCounts[topic] = 0);

    surveyData
        .filter(row => recentYears.includes(row.year))
        .forEach(row => {
            const categories = row.Interest_Categories;
            if (categories && categories !== 'NA') {
                const topics = categories.split(';').map(t => t.trim());
                topics.forEach(topic => {
                    if (emergingTopics.includes(topic)) {
                        topicCounts[topic]++;
                    }
                });
            }
        });

    const ctx = document.getElementById('emergingTopicsChart').getContext('2d');
    new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: emergingTopics,
            datasets: [{
                data: emergingTopics.map(t => topicCounts[t]),
                backgroundColor: [
                    COLORS.primary + 'AA',
                    COLORS.accent + 'AA',
                    COLORS.orange + 'AA',
                    COLORS.brown + 'AA',
                    COLORS.blue + 'AA'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 11 },
                    formatter: (value) => value
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Chart 16: Technician Interest
function createTechnicianInterestChart() {
    const interestCounts = {};
    surveyData.forEach(row => {
        const interest = row['Would.you.be.interested.in.having.a.Soil.Health.Technician.come.out.annually.to.monitor.soil.health.parameters.'];
        if (interest && interest !== 'Not Applicable') {
            interestCounts[interest] = (interestCounts[interest] || 0) + 1;
        }
    });

    const order = ['Yes', 'Maybe', 'No'];
    const orderedData = order.map(i => interestCounts[i] || 0);
    const colors = [COLORS.primary, COLORS.accent, COLORS.red];

    const ctx = document.getElementById('technicianInterestChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: order,
            datasets: [{
                data: orderedData,
                backgroundColor: colors,
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                datalabels: {
                    color: '#fff',
                    font: { weight: 'bold', size: 14 },
                    formatter: (value, ctx) => {
                        const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(0);
                        return value + '\n(' + percentage + '%)';
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Chart 17: Technician Interest by Type
function createTechnicianByTypeChart() {
    const typeTechnician = {};

    surveyData.forEach(row => {
        const type = row.Attendee_Type_Category;
        const interest = row['Would.you.be.interested.in.having.a.Soil.Health.Technician.come.out.annually.to.monitor.soil.health.parameters.'];
        if (type && interest === 'Yes') {
            typeTechnician[type] = (typeTechnician[type] || 0) + 1;
        }
    });

    const sortedTypes = Object.entries(typeTechnician)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const ctx = document.getElementById('technicianByTypeChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedTypes.map(t => t[0]),
            datasets: [{
                label: 'Definite Interest ("Yes")',
                data: sortedTypes.map(t => t[1]),
                backgroundColor: COLORS.primary,
                borderColor: COLORS.accent,
                borderWidth: 2
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    font: { weight: 'bold' }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Chart 18: Technician Interest vs Implementation
function createTechnicianImplementationChart() {
    const technicianLevels = ['Yes', 'Maybe', 'No'];
    const implementationByTech = {};

    surveyData.forEach(row => {
        const techInterest = row['Would.you.be.interested.in.having.a.Soil.Health.Technician.come.out.annually.to.monitor.soil.health.parameters.'];
        const implScore = parseFloat(row.Likelihood_Score);

        if (technicianLevels.includes(techInterest) && !isNaN(implScore)) {
            if (!implementationByTech[techInterest]) implementationByTech[techInterest] = [];
            implementationByTech[techInterest].push(implScore);
        }
    });

    const avgByTech = {};
    Object.keys(implementationByTech).forEach(level => {
        const scores = implementationByTech[level];
        avgByTech[level] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });

    const ctx = document.getElementById('technicianImplementationChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: technicianLevels,
            datasets: [{
                label: 'Average Implementation Likelihood',
                data: technicianLevels.map(l => avgByTech[l]?.toFixed(2) || 0),
                backgroundColor: [COLORS.primary, COLORS.accent, COLORS.orange],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 4,
                    title: { display: true, text: 'Likelihood Score (1-4)' }
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    font: { weight: 'bold', size: 14 }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}
