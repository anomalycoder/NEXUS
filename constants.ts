import { Account, TransactionHistoryItem } from './types';

// Helper to generate circular coordinates
const generateRingCoords = (index: number, total: number, centerX: number, centerY: number, radius: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
    };
};

// Helper to generate mock history
const generateHistory = (isRisk: boolean): TransactionHistoryItem[] => {
    return Array.from({ length: 20 }).map((_, i) => {
        // Base amount in Crores
        let val = Math.random() * 4; // 0-4 Cr normally

        // Occasional spike logic
        const isSpike = Math.random() > 0.85;
        if (isSpike) val += (Math.random() * 8 + 6); // Push it towards 10-14 Cr
        if (!isRisk) val = val * 0.2; // Lower volume for safe accounts

        return {
            date: `T-${20 - i}`,
            amount: parseFloat(val.toFixed(2)),
            isSpike: val > 10 // Threshold for visual spike
        };
    });
};

// Generate Mock Accounts (Database Simulation)
const generateAccounts = (): Account[] => {
    let accounts: Account[] = [];

    // Canvas Size: 1600x900 (Widescreen 16:9)
    const width = 1600;
    const height = 900;

    let totalCount = 0;

    // 1. Create Nodes first (No connections yet)
    // Rings (Repositioned for Widescreen)
    // Reduced count to avoid "All Red" look
    const rings = [
        { x: 800, y: 450, r: 180, count: 8 }, // Center
        { x: 350, y: 250, r: 100, count: 5 },  // Top Left
        { x: 1250, y: 650, r: 100, count: 5 }, // Bottom Right
    ];

    // Build Ring Nodes
    rings.forEach((ring, rIdx) => {
        for (let i = 0; i < ring.count; i++) {
            const coords = generateRingCoords(i, ring.count, ring.x, ring.y, ring.r);
            const id = `NODE-${totalCount++}`;

            // Volume: INR up to 15Cr
            const volVal = (Math.random() * 12 + 1).toFixed(2);

            accounts.push({
                id,
                userId: `USR-${Math.floor(Math.random() * 10000)}`,
                transactionId: `TXN-88${Math.floor(Math.random() * 9999)}`,
                ipAddress: `192.168.0.${Math.floor(Math.random() * 255)}`,
                name: `Acct-${Math.floor(Math.random() * 9000) + 1000}`,
                entity: rIdx === 0 ? 'Shell Corp INT' : 'Mule Account',
                type: 'Shell',
                riskScore: 85 + Math.floor(Math.random() * 15), // High Risk
                status: 'Flagged',

                volume: `₹${volVal}`,
                volumeValue: parseFloat(volVal),
                flagCount: 5 + Math.floor(Math.random() * 10),
                lastActive: 'Now',
                x: coords.x,
                y: coords.y,
                isRingMember: true,
                connections: [],
                history: generateHistory(true)
            });
        }
    });

    // Build Scattered Nodes
    const targetTotal = 150;
    while (accounts.length < targetTotal) {
        // Reduced risk chance to 10% so most nodes are Green/Safe
        const isRisk = Math.random() > 0.90;
        const x = Math.random() * width;
        const y = Math.random() * height;
        const volVal = (Math.random() * 6 + 0.1).toFixed(2);

        accounts.push({
            id: `NODE-${totalCount++}`,
            userId: `USR-${Math.floor(Math.random() * 10000)}`,
            transactionId: `TXN-${Math.floor(Math.random() * 100000)}`,
            ipAddress: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            name: `Acct-${Math.floor(Math.random() * 9000) + 1000}`,
            entity: isRisk ? 'Unverified LLC' : 'Retail User',
            type: isRisk ? 'Corporate' : 'Individual',
            riskScore: isRisk ? 80 + Math.floor(Math.random() * 19) : Math.floor(Math.random() * 40),
            status: isRisk ? 'Flagged' : 'Safe',

            volume: `₹${volVal}`,
            volumeValue: parseFloat(volVal),
            flagCount: isRisk ? Math.floor(Math.random() * 5) : 0,
            lastActive: `${Math.floor(Math.random() * 10)}m ago`,
            x,
            y,
            isRingMember: false,
            connections: [],
            history: generateHistory(isRisk)
        });
    }

    // 2. Establish Connections (Bidirectional)
    // Re-establish Ring Connections manually based on indices
    let currentIndex = 0;
    rings.forEach(ring => {
        const startIndex = currentIndex;
        for (let i = 0; i < ring.count; i++) {
            const currentId = accounts[startIndex + i].id;
            const nextIndex = (i + 1) % ring.count;
            const nextId = accounts[startIndex + nextIndex].id;

            // Connect Current -> Next
            accounts[startIndex + i].connections.push(nextId);
            // Connect Next -> Current (Bidirectional)
            accounts[startIndex + nextIndex].connections.push(currentId);
        }
        currentIndex += ring.count;
    });

    // Establish Scattered Connections
    for (let i = currentIndex; i < accounts.length; i++) {
        // 30% chance to connect to a random node
        if (Math.random() > 0.7) {
            const targetIndex = Math.floor(Math.random() * accounts.length);
            if (targetIndex !== i) {
                const sourceId = accounts[i].id;
                const targetId = accounts[targetIndex].id;

                // Bidirectional push
                if (!accounts[i].connections.includes(targetId)) {
                    accounts[i].connections.push(targetId);
                }
                if (!accounts[targetIndex].connections.includes(sourceId)) {
                    accounts[targetIndex].connections.push(sourceId);
                }
            }
        }
    }

    // Deduplicate connections just in case
    accounts.forEach(acc => {
        acc.connections = [...new Set(acc.connections)];
    });

    return accounts;
};

export const INITIAL_ACCOUNTS: Account[] = generateAccounts();