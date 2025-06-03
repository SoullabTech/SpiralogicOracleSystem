"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.astrologicalService = exports.AstrologicalService = void 0;
const supabaseClient_1 = require("../lib/supabaseClient");
class AstrologicalService {
    constructor() {
        this.userAstroData = new Map();
        this.currentEphemeris = null;
        this.ephemerisUpdateInterval = null;
        this.startEphemerisUpdates();
    }
    // Start periodic ephemeris updates
    startEphemerisUpdates() {
        // Update immediately
        this.updateCurrentEphemeris();
        // Then update every hour
        this.ephemerisUpdateInterval = setInterval(() => {
            this.updateCurrentEphemeris();
        }, 3600000); // 1 hour
    }
    // Update current planetary positions
    async updateCurrentEphemeris() {
        try {
            // In production, this would call a real ephemeris API
            // For now, we'll use calculated positions
            const now = new Date();
            const positions = this.calculateCurrentPositions(now);
            this.currentEphemeris = {
                date: now,
                planets: positions
            };
            // Update all active user holoflowers
            await this.updateAllUserTransits();
        }
        catch (error) {
            console.error('Error updating ephemeris:', error);
        }
    }
    // Calculate current planetary positions (simplified)
    calculateCurrentPositions(date) {
        const positions = new Map();
        // Simplified calculations - in production would use Swiss Ephemeris or similar
        const dayOfYear = this.getDayOfYear(date);
        const year = date.getFullYear();
        // Sun position (approximately 1 degree per day)
        const sunDegree = (dayOfYear - 80) % 360; // Spring equinox around day 80
        positions.set('sun', {
            sign: this.getSignFromDegree(sunDegree),
            degree: sunDegree % 30,
            retrograde: false
        });
        // Moon position (approximately 13 degrees per day)
        const moonDegree = (dayOfYear * 13.176) % 360;
        positions.set('moon', {
            sign: this.getSignFromDegree(moonDegree),
            degree: moonDegree % 30,
            retrograde: false
        });
        // Mercury (approximately 4 degrees per day when direct)
        const mercuryDegree = (dayOfYear * 4.09) % 360;
        positions.set('mercury', {
            sign: this.getSignFromDegree(mercuryDegree),
            degree: mercuryDegree % 30,
            retrograde: this.isMercuryRetrograde(date)
        });
        // Venus (approximately 1.6 degrees per day)
        const venusDegree = (dayOfYear * 1.6) % 360;
        positions.set('venus', {
            sign: this.getSignFromDegree(venusDegree),
            degree: venusDegree % 30,
            retrograde: false
        });
        // Mars (approximately 0.5 degrees per day)
        const marsDegree = (dayOfYear * 0.524) % 360;
        positions.set('mars', {
            sign: this.getSignFromDegree(marsDegree),
            degree: marsDegree % 30,
            retrograde: false
        });
        // Jupiter (approximately 0.083 degrees per day - 12 year cycle)
        const jupiterDegree = ((year - 2020) * 30 + dayOfYear * 0.083) % 360;
        positions.set('jupiter', {
            sign: this.getSignFromDegree(jupiterDegree),
            degree: jupiterDegree % 30,
            retrograde: false
        });
        // Saturn (approximately 0.033 degrees per day - 29.5 year cycle)
        const saturnDegree = ((year - 2020) * 12.2 + dayOfYear * 0.033) % 360;
        positions.set('saturn', {
            sign: this.getSignFromDegree(saturnDegree),
            degree: saturnDegree % 30,
            retrograde: false
        });
        // Outer planets move very slowly
        positions.set('uranus', {
            sign: 'taurus',
            degree: 15 + (year - 2020) * 4.3,
            retrograde: false
        });
        positions.set('neptune', {
            sign: 'pisces',
            degree: 25 + (year - 2020) * 2.1,
            retrograde: false
        });
        positions.set('pluto', {
            sign: 'aquarius',
            degree: 0 + (year - 2024) * 1.5,
            retrograde: false
        });
        return positions;
    }
    // Get day of year
    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date.getTime() - start.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    // Get zodiac sign from absolute degree
    getSignFromDegree(degree) {
        const signs = [
            'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        ];
        const index = Math.floor((degree % 360) / 30);
        return signs[index];
    }
    // Check if Mercury is retrograde (simplified)
    isMercuryRetrograde(date) {
        // Mercury retrograde approximately 3 times per year for 3 weeks each
        const dayOfYear = this.getDayOfYear(date);
        const retroPeriods = [
            { start: 14, end: 35 }, // Mid-Jan to early Feb
            { start: 134, end: 155 }, // Mid-May to early June
            { start: 254, end: 275 } // Mid-Sept to early Oct
        ];
        return retroPeriods.some(period => dayOfYear >= period.start && dayOfYear <= period.end);
    }
    // Update all user transits
    async updateAllUserTransits() {
        if (!this.currentEphemeris)
            return;
        for (const [userId, userData] of this.userAstroData) {
            await this.updateUserTransits(userId);
        }
    }
    // Set user birth data and calculate natal chart
    async setUserBirthData(userId, birthData) {
        try {
            // Save birth data
            await supabaseClient_1.supabase
                .from('user_birth_data')
                .upsert({
                user_id: userId,
                birth_date: birthData.date.toISOString(),
                birth_time: birthData.time,
                birth_lat: birthData.location.lat,
                birth_lng: birthData.location.lng,
                updated_at: new Date().toISOString()
            });
            // Calculate natal chart (simplified)
            const natalChart = await this.calculateNatalChart(birthData);
            // Store in memory
            this.userAstroData.set(userId, {
                userId,
                birthData,
                natalChart,
                currentTransits: [],
                lastUpdate: new Date()
            });
            // Update user's holoflower with natal data
            return natalChart;
        }
        catch (error) {
            console.error('Error setting birth data:', error);
            throw error;
        }
    }
    // Calculate natal chart (simplified)
    async calculateNatalChart(birthData) {
        // In production, this would use a proper astrology calculation library
        // For now, we'll create a simplified natal chart
        const natalPlanets = new Map();
        // Example natal placements (would be calculated based on birth data)
        natalPlanets.set('sun', {
            planet: 'sun',
            sign: 'leo',
            degree: 15,
            retrograde: false,
            strength: 0.9,
            interpretation: 'Strong sense of self and creative expression'
        });
        natalPlanets.set('moon', {
            planet: 'moon',
            sign: 'cancer',
            degree: 22,
            retrograde: false,
            strength: 0.95,
            interpretation: 'Deep emotional intelligence and nurturing nature'
        });
        natalPlanets.set('mercury', {
            planet: 'mercury',
            sign: 'virgo',
            degree: 8,
            retrograde: false,
            strength: 0.85,
            interpretation: 'Analytical mind with attention to detail'
        });
        // Calculate ascendant and midheaven based on birth time and location
        const ascendant = this.calculateAscendant(birthData);
        const midheaven = this.calculateMidheaven(birthData);
        return {
            birthData,
            ascendant,
            midheaven,
            planets: natalPlanets,
            houses: this.calculateHouseCusps(ascendant)
        };
    }
    // Calculate ascendant (simplified)
    calculateAscendant(birthData) {
        // Simplified calculation based on birth time
        const hour = parseInt(birthData.time.split(':')[0]);
        const signs = [
            'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        ];
        return signs[Math.floor(hour / 2) % 12];
    }
    // Calculate midheaven (simplified)
    calculateMidheaven(birthData) {
        // Simplified - would use actual calculations
        const ascIndex = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
            .indexOf(this.calculateAscendant(birthData));
        const signs = [
            'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        ];
        return signs[(ascIndex + 9) % 12]; // MC is roughly 9 signs from ASC
    }
    // Calculate house cusps
    calculateHouseCusps(ascendant) {
        // Simplified equal house system
        const ascIndex = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
            .indexOf(ascendant);
        const cusps = [];
        for (let i = 0; i < 12; i++) {
            cusps.push((ascIndex * 30 + i * 30) % 360);
        }
        return cusps;
    }
    // Get user's current astrological state
    async getUserAstrologicalState(userId) {
        let userData = this.userAstroData.get(userId);
        if (!userData) {
            // Load from database
            const { data: birthData } = await supabaseClient_1.supabase
                .from('user_birth_data')
                .select('*')
                .eq('user_id', userId)
                .single();
            if (birthData) {
                userData = {
                    userId,
                    birthData: {
                        date: new Date(birthData.birth_date),
                        time: birthData.birth_time,
                        location: { lat: birthData.birth_lat, lng: birthData.birth_lng }
                    },
                    currentTransits: [],
                    lastUpdate: new Date()
                };
                // Calculate natal chart
                userData.natalChart = await this.calculateNatalChart(userData.birthData);
                this.userAstroData.set(userId, userData);
            }
        }
        // Update current transits
        if (userData) {
            await this.updateUserTransits(userId);
        }
        return userData;
    }
    // Update user's current transits
    async updateUserTransits(userId) {
        const userData = this.userAstroData.get(userId);
        if (!userData || !this.currentEphemeris)
            return;
        const transits = [];
        // Calculate which houses are being transited
        this.currentEphemeris.planets.forEach((position, planet) => {
            const houseNumber = this.getTransitedHouse(position, userData.natalChart);
            if (houseNumber) {
                transits.push({
                    planet,
                    sign: position.sign,
                    degree: position.degree,
                    retrograde: position.retrograde,
                    orb: 0, // Would calculate actual orb
                    influence: this.getTransitInterpretation(planet, houseNumber),
                    startDate: new Date(), // Would calculate actual dates
                    exactDate: new Date(),
                    endDate: new Date()
                });
            }
        });
        userData.currentTransits = transits;
        userData.lastUpdate = new Date();
        // Save to database
        await supabaseClient_1.supabase
            .from('user_transits')
            .upsert({
            user_id: userId,
            transits,
            updated_at: new Date().toISOString()
        });
    }
    // Get which house is being transited
    getTransitedHouse(position, natalChart) {
        if (!natalChart || !natalChart.houses)
            return null;
        const absoluteDegree = this.getAbsoluteDegree(position.sign, position.degree);
        for (let i = 0; i < 12; i++) {
            const houseCusp = natalChart.houses[i];
            const nextCusp = natalChart.houses[(i + 1) % 12];
            if (this.isDegreeInHouse(absoluteDegree, houseCusp, nextCusp)) {
                return i + 1;
            }
        }
        return null;
    }
    // Check if degree is in house
    isDegreeInHouse(degree, cuspStart, cuspEnd) {
        if (cuspEnd < cuspStart) {
            // House crosses 0 degrees
            return degree >= cuspStart || degree < cuspEnd;
        }
        return degree >= cuspStart && degree < cuspEnd;
    }
    // Get absolute degree from sign and degree
    getAbsoluteDegree(sign, degree) {
        const signs = [
            'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
            'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
        ];
        const signIndex = signs.indexOf(sign);
        return signIndex * 30 + degree;
    }
    // Get transit interpretation
    getTransitInterpretation(planet, houseNumber) {
        const interpretations = {
            sun: {
                1: 'Time to shine and express your authentic self',
                2: 'Focus on building resources and self-worth',
                3: 'Communication and learning are highlighted',
                4: 'Attention turns to home and emotional foundations',
                5: 'Creative self-expression and joy are emphasized',
                6: 'Health and daily routines need attention',
                7: 'Relationships come into focus',
                8: 'Deep transformation and shared resources',
                9: 'Expanding horizons through learning and travel',
                10: 'Career and public life are illuminated',
                11: 'Social connections and future visions',
                12: 'Spiritual reflection and inner work'
            },
            moon: {
                1: 'Emotional awareness of self',
                2: 'Feelings about security and values',
                3: 'Emotional communication',
                4: 'Deep feelings about home and family',
                5: 'Emotional creativity and play',
                6: 'Feelings about health and service',
                7: 'Emotional needs in relationships',
                8: 'Deep emotional transformation',
                9: 'Emotional expansion and belief',
                10: 'Public emotional expression',
                11: 'Emotional connections with groups',
                12: 'Hidden emotions surface'
            }
            // ... other planets
        };
        return interpretations[planet]?.[houseNumber] ||
            `${planet} activating house ${houseNumber}`;
    }
    // Get current lunar phase
    getCurrentLunarPhase() {
        const synodicMonth = 29.53059;
        const knownNewMoon = new Date('2024-01-11');
        const now = new Date();
        const daysSince = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
        const phasePercentage = (daysSince % synodicMonth) / synodicMonth;
        let phase = 'New Moon';
        if (phasePercentage < 0.125)
            phase = 'New Moon';
        else if (phasePercentage < 0.25)
            phase = 'Waxing Crescent';
        else if (phasePercentage < 0.375)
            phase = 'First Quarter';
        else if (phasePercentage < 0.5)
            phase = 'Waxing Gibbous';
        else if (phasePercentage < 0.625)
            phase = 'Full Moon';
        else if (phasePercentage < 0.75)
            phase = 'Waning Gibbous';
        else if (phasePercentage < 0.875)
            phase = 'Last Quarter';
        else
            phase = 'Waning Crescent';
        return { phase, percentage: phasePercentage };
    }
    // Get seasonal energy
    getCurrentSeasonalEnergy() {
        const now = new Date();
        const month = now.getMonth();
        const day = now.getDate();
        // Approximate seasonal boundaries
        if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21)) {
            return { season: 'Spring', energy: 'New beginnings and growth' };
        }
        else if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 23)) {
            return { season: 'Summer', energy: 'Full expression and abundance' };
        }
        else if ((month === 8 && day >= 23) || month === 9 || month === 10 || (month === 11 && day < 21)) {
            return { season: 'Autumn', energy: 'Harvest and reflection' };
        }
        else {
            return { season: 'Winter', energy: 'Rest and regeneration' };
        }
    }
    // Get void of course moon periods
    getVoidOfCoursePeriods() {
        // Simplified - would calculate actual VOC periods
        const periods = [];
        const now = new Date();
        // Example VOC period
        periods.push({
            start: new Date(now.getTime() + 3600000), // 1 hour from now
            end: new Date(now.getTime() + 7200000) // 2 hours from now
        });
        return periods;
    }
    // Get retrograde planets
    getRetrogradePlanets() {
        if (!this.currentEphemeris)
            return [];
        const retrogrades = [];
        this.currentEphemeris.planets.forEach((position, planet) => {
            if (position.retrograde) {
                retrogrades.push(planet);
            }
        });
        return retrogrades;
    }
    // Cleanup
    cleanup() {
        if (this.ephemerisUpdateInterval) {
            clearInterval(this.ephemerisUpdateInterval);
        }
    }
}
exports.AstrologicalService = AstrologicalService;
exports.astrologicalService = new AstrologicalService();
