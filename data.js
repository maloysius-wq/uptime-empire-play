window.UptimeEmpireData = {
  "STORAGE_KEY": "uptime_empire_expanded_v1",
  "purchaseModes": [
    1,
    10,
    25,
    100,
    "MAX"
  ],
  "categories": [
    "Servers",
    "Networking",
    "Cloud",
    "Facilities",
    "Frontier"
  ],
  "milestoneDefs": [
    {
      "count": 10,
      "mult": 2
    },
    {
      "count": 25,
      "mult": 2
    },
    {
      "count": 50,
      "mult": 3
    },
    {
      "count": 100,
      "mult": 5
    },
    {
      "count": 250,
      "mult": 10
    },
    {
      "count": 500,
      "mult": 25
    }
  ],
  "buddyLines": [
    "patching...",
    "coffee loop",
    "deploying vibes",
    "cooling nominal",
    "latency snack break",
    "racking dreams",
    "still blinking",
    "synergy acquired",
    "cables untangled",
    "coffee -> uptime",
    "auditing packets",
    "tiny empire walk",
    "maintenance goblin",
    "quest squad ready",
    "all lights greenish",
    "spare drives located",
    "incident? never heard of her",
    "clean cable, clean soul",
    "more racks, more snacks",
    "moon branch looks stable",
    "badge shelf flex",
    "research tree spicy",
    "boss incident? rude",
    "suite upgrade approved",
    "mission queue stacked",
    "containment mostly stable"
  ],
  "officeSuiteDefs": [
    {
      "id": "regular",
      "name": "Regular Office",
      "slots": 1,
      "costCredits": 0,
      "costResearch": 0,
      "desc": "One decor item fits. Cozy, cheap, slightly cramped."
    },
    {
      "id": "suite",
      "name": "Expanded Suite",
      "slots": 3,
      "costCredits": 150000,
      "costResearch": 4,
      "desc": "A proper room with enough wall space for hobbies and dashboards."
    },
    {
      "id": "opswing",
      "name": "Ops Wing",
      "slots": 5,
      "costCredits": 25000000,
      "costResearch": 18,
      "desc": "A bigger office with room for your favorite nonsense and a tiny bit of dignity."
    },
    {
      "id": "commandfloor",
      "name": "Command Floor",
      "slots": 8,
      "costCredits": 3500000000,
      "costResearch": 60,
      "desc": "At this point the office is practically a mini-NOC."
    },
    {
      "id": "executivecampus",
      "name": "Executive Campus Suite",
      "slots": 12,
      "costCredits": 1800000000000,
      "costResearch": 180,
      "desc": "Your little buddy now lives in a prestige aquarium of polished uptime excess."
    },
    {
      "id": "skybridge",
      "name": "Skybridge Command Suite",
      "slots": 16,
      "costCredits": 420000000000000,
      "costResearch": 420,
      "desc": "A panoramic control room with enough real estate for trophy nonsense and backup nonsense."
    },
    {
      "id": "orbitaldeck",
      "name": "Orbital Command Deck",
      "slots": 20,
      "costCredits": 190000000000000000,
      "costResearch": 960,
      "desc": "Half office, half myth, all blinking authority."
    }
  ],
  "generatorDefs": [
    {
      "id": "home",
      "icon": "🖥️",
      "name": "Home Lab Node",
      "category": "Servers",
      "desc": "A scrappy little machine with more ambition than airflow.",
      "managerName": "Sysadmin Alex",
      "baseCost": 10,
      "growth": 1.07,
      "cycle": 1,
      "payout": 1,
      "managerCost": 250,
      "unlockAt": 0,
      "capacityUse": 1,
      "tier": 1
    },
    {
      "id": "refurb",
      "icon": "📦",
      "name": "Refurb Rack Server",
      "category": "Servers",
      "desc": "Second-hand iron, first-class hustle.",
      "managerName": "Ops Lead Marisol",
      "baseCost": 100,
      "growth": 1.08,
      "cycle": 3,
      "payout": 12,
      "managerCost": 3200,
      "unlockAt": 50,
      "capacityUse": 1,
      "tier": 2
    },
    {
      "id": "rack",
      "icon": "🗄️",
      "name": "Small Server Rack",
      "category": "Facilities",
      "desc": "The garage starts taking itself very seriously.",
      "managerName": "Rack Wrangler Benji",
      "baseCost": 1200,
      "growth": 1.09,
      "cycle": 6,
      "payout": 90,
      "managerCost": 40000,
      "unlockAt": 600,
      "capacityUse": 2,
      "tier": 3
    },
    {
      "id": "switch",
      "icon": "🔀",
      "name": "Top-of-Rack Switch Stack",
      "category": "Networking",
      "desc": "Throughput rises. Bottlenecks hiss and retreat.",
      "managerName": "Network Lead Priya",
      "baseCost": 12000,
      "growth": 1.09,
      "cycle": 12,
      "payout": 650,
      "managerCost": 550000,
      "unlockAt": 9000,
      "capacityUse": 1,
      "tier": 4
    },
    {
      "id": "cluster",
      "icon": "☁️",
      "name": "Virtualization Cluster",
      "category": "Cloud",
      "desc": "Dense compute and the first taste of real scale.",
      "managerName": "Cluster Engineer Omar",
      "baseCost": 150000,
      "growth": 1.1,
      "cycle": 30,
      "payout": 5400,
      "managerCost": 8500000,
      "unlockAt": 110000,
      "capacityUse": 3,
      "tier": 5
    },
    {
      "id": "pod",
      "icon": "🧰",
      "name": "Enterprise Compute Pod",
      "category": "Servers",
      "desc": "A disciplined slab of enterprise seriousness.",
      "managerName": "Platform Chief Lena",
      "baseCost": 2000000,
      "growth": 1.1,
      "cycle": 60,
      "payout": 40000,
      "managerCost": 90000000,
      "unlockAt": 1600000,
      "capacityUse": 4,
      "tier": 6
    },
    {
      "id": "hall",
      "icon": "🏢",
      "name": "Private Data Center Hall",
      "category": "Facilities",
      "desc": "You now own a room with enough humming to feel important.",
      "managerName": "Site Director Hana",
      "baseCost": 30000000,
      "growth": 1.11,
      "cycle": 180,
      "payout": 320000,
      "managerCost": 1800000000,
      "unlockAt": 22000000,
      "capacityUse": 8,
      "tier": 7
    },
    {
      "id": "colo",
      "icon": "🧱",
      "name": "Colocation Facility",
      "category": "Facilities",
      "desc": "External clients arrive with invoices and expectations.",
      "managerName": "Colo Supervisor Dev",
      "baseCost": 500000000,
      "growth": 1.11,
      "cycle": 600,
      "payout": 2800000,
      "managerCost": 26000000000,
      "unlockAt": 340000000,
      "capacityUse": 12,
      "tier": 8
    },
    {
      "id": "regional",
      "icon": "🌐",
      "name": "Regional Cloud Zone",
      "category": "Cloud",
      "desc": "Demand stops being local and starts being meteorological.",
      "managerName": "Regional SRE Imani",
      "baseCost": 8000000000,
      "growth": 1.12,
      "cycle": 1800,
      "payout": 25000000,
      "managerCost": 500000000000,
      "unlockAt": 6000000000,
      "capacityUse": 20,
      "tier": 9
    },
    {
      "id": "global",
      "icon": "🛰️",
      "name": "Global Cloud Region",
      "category": "Cloud",
      "desc": "Your footprint now has weather patterns and politics.",
      "managerName": "Cloud Director Niko",
      "baseCost": 120000000000,
      "growth": 1.12,
      "cycle": 7200,
      "payout": 220000000,
      "managerCost": 8000000000000,
      "unlockAt": 90000000000,
      "capacityUse": 30,
      "tier": 10
    },
    {
      "id": "hyperscale",
      "icon": "🏭",
      "name": "Hyperscale Campus",
      "category": "Facilities",
      "desc": "Industrial-scale compute with forklift-sized consequences.",
      "managerName": "Campus VP Mirela",
      "baseCost": 2000000000000,
      "growth": 1.13,
      "cycle": 28800,
      "payout": 2500000000,
      "managerCost": 150000000000000,
      "unlockAt": 1500000000000,
      "capacityUse": 45,
      "tier": 11
    },
    {
      "id": "ai",
      "icon": "🤖",
      "name": "AI Compute Mega-Farm",
      "category": "Frontier",
      "desc": "Warehouse after warehouse of very expensive thinking rocks.",
      "managerName": "AI Ops Kaito",
      "baseCost": 40000000000000,
      "growth": 1.13,
      "cycle": 86400,
      "payout": 32000000000,
      "managerCost": 3000000000000000,
      "unlockAt": 25000000000000,
      "capacityUse": 60,
      "tier": 12
    },
    {
      "id": "orbital",
      "icon": "🛸",
      "name": "Orbital Edge Array",
      "category": "Frontier",
      "desc": "Low gravity. High stakes. Ridiculous invoices.",
      "managerName": "Orbital Chief Sol",
      "baseCost": 900000000000000,
      "growth": 1.14,
      "cycle": 172800,
      "payout": 500000000000,
      "managerCost": 80000000000000000,
      "unlockAt": 600000000000000,
      "capacityUse": 80,
      "tier": 13
    },
    {
      "id": "quantum",
      "icon": "⚛️",
      "name": "Quantum Nexus Facility",
      "category": "Frontier",
      "desc": "Reality itself now fills out a maintenance ticket.",
      "managerName": "Facility AI Patch-7",
      "baseCost": 20000000000000000,
      "growth": 1.15,
      "cycle": 604800,
      "payout": 8000000000000,
      "managerCost": 2500000000000000000,
      "unlockAt": 15000000000000000,
      "capacityUse": 120,
      "tier": 14
    }
  ],
  "regionDefs": [
    {
      "id": "garage",
      "icon": "🔌",
      "name": "Garage Lab",
      "desc": "A brave pile of blinking equipment and one deeply concerned power strip.",
      "baseCapacity": 26,
      "capPerLevel": 18,
      "unlockCost": 0,
      "expansionBaseCost": 2000,
      "effects": {},
      "project": {
        "id": "garage-cable",
        "icon": "🧹",
        "name": "Cable Trays",
        "desc": "Permanent server income boost and a cleaner-looking lab.",
        "costCredits": 18000,
        "effects": {
          "categoryMultiply": {
            "Servers": 1.25
          },
          "multiply": {
            "missionReward": 1.03
          }
        }
      }
    },
    {
      "id": "business",
      "icon": "🏬",
      "name": "Business Park Suite",
      "desc": "Real lease. Real hallways. Fake confidence becoming actual confidence.",
      "baseCapacity": 60,
      "capPerLevel": 28,
      "unlockCost": 25000,
      "expansionBaseCost": 45000,
      "effects": {
        "speed": 0.05
      },
      "project": {
        "id": "business-bullpen",
        "icon": "🪑",
        "name": "Support Bullpen",
        "desc": "Adds a mission team and trims cooldowns for smaller jobs.",
        "costCredits": 250000,
        "costResearch": 2,
        "effects": {
          "add": {
            "missionSlots": 1,
            "missionCooldownReduction": 0.08
          }
        }
      }
    },
    {
      "id": "useast",
      "icon": "🗽",
      "name": "US East Hub",
      "desc": "Fast cycles, brisk demand, lots of blinking at reasonable latency.",
      "baseCapacity": 130,
      "capPerLevel": 48,
      "unlockCost": 4500000,
      "expansionBaseCost": 1500000,
      "effects": {
        "speed": 0.08
      },
      "project": {
        "id": "useast-peering",
        "icon": "🕸️",
        "name": "Local Peering Mesh",
        "desc": "Networking income climbs and cloud missions complete more cleanly.",
        "costCredits": 8000000,
        "costResearch": 4,
        "effects": {
          "categoryMultiply": {
            "Networking": 1.35,
            "Cloud": 1.1
          },
          "multiply": {
            "speed": 1.05,
            "missionSpeed": 1.05
          }
        }
      }
    },
    {
      "id": "euro",
      "icon": "🌿",
      "name": "European Green Grid",
      "desc": "Energy efficiency and very tidy documentation vibes.",
      "baseCapacity": 240,
      "capPerLevel": 82,
      "unlockCost": 120000000,
      "expansionBaseCost": 30000000,
      "effects": {
        "expansionDiscount": 0.12
      },
      "project": {
        "id": "euro-heat",
        "icon": "♻️",
        "name": "Heat Recovery Loop",
        "desc": "Waste heat becomes a permanent global income and capacity advantage.",
        "costCredits": 175000000,
        "costResearch": 8,
        "effects": {
          "multiply": {
            "globalIncome": 1.08
          },
          "add": {
            "capacityBonus": 0.05,
            "researchBonus": 0.05
          }
        }
      }
    },
    {
      "id": "apac",
      "icon": "📈",
      "name": "Asia-Pacific Exchange",
      "desc": "Demand arrives in waves and leaves invoices in its wake.",
      "baseCapacity": 400,
      "capPerLevel": 120,
      "unlockCost": 4500000000,
      "expansionBaseCost": 900000000,
      "effects": {
        "income": 0.15
      },
      "project": {
        "id": "apac-aiops",
        "icon": "📦",
        "name": "Follow-the-Sun Service Desk",
        "desc": "Response gets faster and mission throughput jumps.",
        "costCredits": 8500000000,
        "costResearch": 12,
        "effects": {
          "add": {
            "responsePower": 0.3
          },
          "multiply": {
            "missionSpeed": 1.15,
            "missionReward": 1.06
          }
        }
      }
    },
    {
      "id": "north",
      "icon": "❄️",
      "name": "Northern Cooling Basin",
      "desc": "Cold air turns giant hardware into slightly less giant capacity problems.",
      "baseCapacity": 700,
      "capPerLevel": 180,
      "unlockCost": 180000000000,
      "expansionBaseCost": 25000000000,
      "effects": {
        "highTierCapacityReduction": 0.1
      },
      "project": {
        "id": "north-spares",
        "icon": "🧰",
        "name": "Spare Parts Annex",
        "desc": "Incidents resolve faster and hardware failures barely dent output.",
        "costCredits": 260000000000,
        "costResearch": 20,
        "effects": {
          "add": {
            "incidentDurationReduction": 0.2,
            "responsePower": 0.1
          },
          "categoryIncidentShield": {
            "Servers": 0.15,
            "Facilities": 0.12
          }
        }
      }
    },
    {
      "id": "core",
      "icon": "🏙️",
      "name": "Continental Core Campus",
      "desc": "A concrete poem dedicated to throughput.",
      "baseCapacity": 1200,
      "capPerLevel": 280,
      "unlockCost": 4500000000000,
      "expansionBaseCost": 650000000000,
      "effects": {
        "income": 0.25
      },
      "project": {
        "id": "core-orchestrator",
        "icon": "🎛️",
        "name": "Global Orchestrator",
        "desc": "Automated income and mission payouts surge permanently.",
        "costCredits": 8000000000000,
        "costResearch": 40,
        "effects": {
          "multiply": {
            "missionReward": 1.2,
            "automatedIncome": 1.1,
            "globalIncome": 1.05
          }
        }
      }
    },
    {
      "id": "lunar",
      "icon": "🌕",
      "name": "Lunar Crater Vault",
      "desc": "Moon dust, silent halls, and output that makes spreadsheets faint.",
      "baseCapacity": 2500,
      "capPerLevel": 600,
      "unlockCost": 160000000000000,
      "expansionBaseCost": 25000000000000,
      "effects": {
        "categoryBonus": {
          "Frontier": 2
        }
      },
      "project": {
        "id": "lunar-vault",
        "icon": "🧬",
        "name": "Deep Research Vault",
        "desc": "Moon research makes RD matter a lot more and chills out future incidents.",
        "costCredits": 220000000000000,
        "costResearch": 60,
        "effects": {
          "multiply": {
            "researchBonus": 1.5,
            "missionReward": 1.1
          },
          "add": {
            "incidentChanceReduction": 0.08,
            "missionCooldownReduction": 0.12
          }
        }
      }
    }
  ],
  "upgradeDefs": [
    {
      "id": "global-cleanup",
      "view": "global",
      "icon": "🧹",
      "name": "Cable Cleanup Initiative",
      "desc": "All infrastructure income x2.",
      "cost": 250,
      "effects": {
        "multiply": {
          "globalIncome": 2
        }
      },
      "visibleWhen": {
        "lifetimeCredits": 100
      }
    },
    {
      "id": "ops-dashboards",
      "view": "automation",
      "icon": "📊",
      "name": "Ops Dashboards",
      "desc": "Managers cost -10% and automated income x1.25.",
      "cost": 7500,
      "effects": {
        "add": {
          "managerDiscount": 0.1
        },
        "multiply": {
          "automatedIncome": 1.25
        }
      },
      "visibleWhen": {
        "managers": 1
      }
    },
    {
      "id": "server-firmware",
      "view": "category",
      "icon": "💾",
      "name": "Firmware Rollout",
      "desc": "Servers income x2.",
      "cost": 3000,
      "effects": {
        "categoryMultiply": {
          "Servers": 2
        }
      },
      "visibleWhen": {
        "ownedCategory": {
          "category": "Servers",
          "amount": 25
        }
      }
    },
    {
      "id": "network-backbone",
      "view": "category",
      "icon": "🕸️",
      "name": "Backbone Optimization",
      "desc": "Networking income x3.",
      "cost": 120000,
      "effects": {
        "categoryMultiply": {
          "Networking": 3
        }
      },
      "visibleWhen": {
        "ownedId": {
          "id": "switch",
          "amount": 10
        }
      }
    },
    {
      "id": "workflow-suite",
      "view": "automation",
      "icon": "⚙️",
      "name": "Workflow Automation Suite",
      "desc": "All cycle speeds +20%.",
      "cost": 18000,
      "effects": {
        "multiply": {
          "speed": 1.2
        }
      },
      "visibleWhen": {
        "managers": 2
      }
    },
    {
      "id": "battery-backup",
      "view": "facilities",
      "icon": "🔋",
      "name": "Battery Backup & Checkpointing",
      "desc": "Offline cap +4 hours and offline efficiency +15%.",
      "cost": 450000,
      "effects": {
        "add": {
          "offlineCapHours": 4,
          "offlineEfficiency": 0.15
        }
      },
      "visibleWhen": {
        "managers": 3
      }
    },
    {
      "id": "hypervisor-tuning",
      "view": "category",
      "icon": "🧠",
      "name": "Hypervisor Tuning",
      "desc": "Cloud and Facilities income x3.",
      "cost": 2500000,
      "effects": {
        "categoryMultiply": {
          "Cloud": 3,
          "Facilities": 3
        }
      },
      "visibleWhen": {
        "ownedId": {
          "id": "cluster",
          "amount": 5
        }
      }
    },
    {
      "id": "free-cooling",
      "view": "facilities",
      "icon": "🌬️",
      "name": "Free Cooling Intake",
      "desc": "Total capacity +10%.",
      "cost": 5000000,
      "effects": {
        "add": {
          "capacityBonus": 0.1
        }
      },
      "visibleWhen": {
        "unlockedRegion": "useast"
      }
    },
    {
      "id": "bulk-contracts",
      "view": "global",
      "icon": "📦",
      "name": "Bulk Hardware Contracts",
      "desc": "All infrastructure costs -8%.",
      "cost": 18000000,
      "effects": {
        "add": {
          "costReduction": 0.08
        }
      },
      "visibleWhen": {
        "lifetimeCredits": 10000000
      }
    },
    {
      "id": "follow-the-sun",
      "view": "global",
      "icon": "🌍",
      "name": "Follow-the-Sun Operations",
      "desc": "All infrastructure income x5.",
      "cost": 25000000,
      "effects": {
        "multiply": {
          "globalIncome": 5
        }
      },
      "visibleWhen": {
        "lifetimeCredits": 10000000
      }
    },
    {
      "id": "uptime-scripts",
      "view": "automation",
      "icon": "📜",
      "name": "Runbook Scripts",
      "desc": "Automated income x1.75.",
      "cost": 110000000,
      "effects": {
        "multiply": {
          "automatedIncome": 1.75
        }
      },
      "visibleWhen": {
        "managers": 5
      }
    },
    {
      "id": "expansion-cranes",
      "view": "facilities",
      "icon": "🏗️",
      "name": "Expansion Cranes",
      "desc": "Region unlock and expansion costs -15%.",
      "cost": 260000000,
      "effects": {
        "add": {
          "regionCostReduction": 0.15
        }
      },
      "visibleWhen": {
        "unlockedRegion": "apac"
      }
    },
    {
      "id": "frontier-acceleration",
      "view": "category",
      "icon": "🚀",
      "name": "Frontier Acceleration",
      "desc": "Frontier income x2.5.",
      "cost": 85000000000,
      "effects": {
        "categoryMultiply": {
          "Frontier": 2.5
        }
      },
      "visibleWhen": {
        "ownedId": {
          "id": "ai",
          "amount": 1
        }
      }
    },
    {
      "id": "quantum-safety",
      "view": "facilities",
      "icon": "🧪",
      "name": "Containment Refits",
      "desc": "High-tier capacity usage -10%.",
      "cost": 4200000000000,
      "effects": {
        "add": {
          "highTierCapacityReduction": 0.1
        }
      },
      "visibleWhen": {
        "ownedId": {
          "id": "hyperscale",
          "amount": 1
        }
      }
    },
    {
      "id": "stellar-markets",
      "view": "global",
      "icon": "✨",
      "name": "Stellar Demand Contracts",
      "desc": "All income x8.",
      "cost": 200000000000000,
      "effects": {
        "multiply": {
          "globalIncome": 8
        }
      },
      "visibleWhen": {
        "unlockedRegion": "lunar"
      }
    },
    {
      "id": "runbook-library",
      "view": "resilience",
      "icon": "📚",
      "name": "Incident Runbook Library",
      "desc": "Incidents resolve 15% faster.",
      "cost": 95000,
      "effects": {
        "add": {
          "incidentDurationReduction": 0.15
        }
      },
      "visibleWhen": {
        "managers": 2
      }
    },
    {
      "id": "immutable-snapshots",
      "view": "resilience",
      "icon": "📼",
      "name": "Immutable Snapshots",
      "desc": "Security incidents are less nasty and offline efficiency +5%.",
      "cost": 1450000,
      "effects": {
        "add": {
          "incidentSeverityReduction": 0.1,
          "offlineEfficiency": 0.05
        }
      },
      "visibleWhen": {
        "lifetimeCredits": 500000
      }
    },
    {
      "id": "predictive-monitoring",
      "view": "resilience",
      "icon": "📡",
      "name": "Predictive Monitoring",
      "desc": "Incident chance -12%.",
      "cost": 4200000,
      "effects": {
        "add": {
          "incidentChanceReduction": 0.12
        }
      },
      "visibleWhen": {
        "unlockedRegion": "useast"
      }
    },
    {
      "id": "hot-swap-bays",
      "view": "resilience",
      "icon": "💿",
      "name": "Hot-Swap Drive Bays",
      "desc": "Server failures hurt less and response power +20%.",
      "cost": 25000000,
      "effects": {
        "add": {
          "responsePower": 0.2
        },
        "categoryIncidentShield": {
          "Servers": 0.12
        }
      },
      "visibleWhen": {
        "ownedId": {
          "id": "pod",
          "amount": 1
        }
      }
    },
    {
      "id": "quest-board",
      "view": "automation",
      "icon": "🗂️",
      "name": "Ops Quest Board",
      "desc": "Mission slots +1.",
      "cost": 380000,
      "effects": {
        "add": {
          "missionSlots": 1
        }
      },
      "visibleWhen": {
        "managers": 2
      }
    },
    {
      "id": "research-cluster",
      "view": "resilience",
      "icon": "🧪",
      "name": "Internal Research Cluster",
      "desc": "Mission research rewards x1.35.",
      "cost": 820000000,
      "effects": {
        "multiply": {
          "researchBonus": 1.35
        }
      },
      "visibleWhen": {
        "missionsCompleted": 4
      }
    },
    {
      "id": "dispatch-orchestrator",
      "view": "automation",
      "icon": "📬",
      "name": "Dispatch Orchestrator",
      "desc": "Mission speed x1.2 and mission rewards x1.15.",
      "cost": 1300000000,
      "effects": {
        "multiply": {
          "missionSpeed": 1.2,
          "missionReward": 1.15
        }
      },
      "visibleWhen": {
        "missionsCompleted": 6
      }
    },
    {
      "id": "soc-war-room",
      "view": "resilience",
      "icon": "🚨",
      "name": "SOC War Room",
      "desc": "Incident chance -8%, severity down, response up.",
      "cost": 9500000000,
      "effects": {
        "add": {
          "incidentChanceReduction": 0.08,
          "incidentSeverityReduction": 0.08,
          "responsePower": 0.15
        }
      },
      "visibleWhen": {
        "incidentsResolved": 6
      }
    },
    {
      "id": "high-trust-fabric",
      "view": "resilience",
      "icon": "🧷",
      "name": "High-Trust Fabric",
      "desc": "Automated systems resist intrusion better.",
      "cost": 88000000000,
      "effects": {
        "categoryIncidentShield": {
          "Cloud": 0.12,
          "Networking": 0.1
        },
        "add": {
          "incidentChanceReduction": 0.06
        }
      },
      "visibleWhen": {
        "unlockedRegion": "core"
      }
    },
    {
      "id": "moon-backups",
      "view": "resilience",
      "icon": "🌕",
      "name": "Off-World Backups",
      "desc": "Offline efficiency +10% and incident shield lasts longer through your runs.",
      "cost": 440000000000000,
      "effects": {
        "add": {
          "offlineEfficiency": 0.1,
          "incidentDurationReduction": 0.08
        }
      },
      "visibleWhen": {
        "unlockedRegion": "lunar"
      }
    },
    {
      "id": "lab-notebooks",
      "view": "research",
      "icon": "📓",
      "name": "Lab Notebooks",
      "desc": "Spend RD to improve mission research rewards and unlock the idea of organized science.",
      "cost": 90000,
      "costResearch": 3,
      "effects": {
        "multiply": {
          "researchBonus": 1.15
        }
      },
      "visibleWhen": {
        "missionsCompleted": 1
      },
      "branch": "Theory"
    },
    {
      "id": "prototype-foundry",
      "view": "research",
      "icon": "🔬",
      "name": "Prototype Foundry",
      "desc": "All income x1.3 and research rewards x1.15.",
      "cost": 2200000,
      "costResearch": 6,
      "effects": {
        "multiply": {
          "globalIncome": 1.3,
          "researchBonus": 1.15
        }
      },
      "visibleWhen": {
        "research": 6
      },
      "branch": "Theory",
      "requires": [
        "lab-notebooks"
      ]
    },
    {
      "id": "mission-simulators",
      "view": "research",
      "icon": "🧠",
      "name": "Mission Simulators",
      "desc": "Mission speed x1.15 and cooldowns -10%.",
      "cost": 35000000,
      "costResearch": 12,
      "effects": {
        "multiply": {
          "missionSpeed": 1.15
        },
        "add": {
          "missionCooldownReduction": 0.1
        }
      },
      "visibleWhen": {
        "missionsCompleted": 4
      },
      "branch": "Ops",
      "requires": [
        "prototype-foundry"
      ]
    },
    {
      "id": "autonomous-patching",
      "view": "research",
      "icon": "🩹",
      "name": "Autonomous Patching",
      "desc": "Automated income x1.4 and incidents appear slightly less often.",
      "cost": 420000000,
      "costResearch": 18,
      "effects": {
        "multiply": {
          "automatedIncome": 1.4
        },
        "add": {
          "incidentChanceReduction": 0.06
        }
      },
      "visibleWhen": {
        "incidentsResolved": 3
      },
      "branch": "Security",
      "requires": [
        "lab-notebooks"
      ]
    },
    {
      "id": "composite-coolants",
      "view": "research",
      "icon": "🧪",
      "name": "Composite Coolants",
      "desc": "Capacity +12% and facilities income x1.4.",
      "cost": 1800000000,
      "costResearch": 26,
      "effects": {
        "add": {
          "capacityBonus": 0.12
        },
        "categoryMultiply": {
          "Facilities": 1.4
        }
      },
      "visibleWhen": {
        "unlockedRegion": "north"
      },
      "branch": "Materials",
      "requires": [
        "prototype-foundry"
      ]
    },
    {
      "id": "deep-queue-theory",
      "view": "research",
      "icon": "📈",
      "name": "Deep Queue Theory",
      "desc": "Networking and Cloud income x1.5.",
      "cost": 9500000000,
      "costResearch": 34,
      "effects": {
        "categoryMultiply": {
          "Networking": 1.5,
          "Cloud": 1.5
        }
      },
      "visibleWhen": {
        "ownedId": {
          "id": "regional",
          "amount": 1
        }
      },
      "branch": "Ops",
      "requires": [
        "mission-simulators"
      ]
    },
    {
      "id": "moon-models",
      "view": "research",
      "icon": "🌔",
      "name": "Moon Models",
      "desc": "Frontier income x1.75 and research rewards x1.25.",
      "cost": 3200000000000,
      "costResearch": 80,
      "effects": {
        "categoryMultiply": {
          "Frontier": 1.75
        },
        "multiply": {
          "researchBonus": 1.25
        }
      },
      "visibleWhen": {
        "unlockedRegion": "lunar"
      },
      "branch": "Frontier",
      "requires": [
        "deep-queue-theory",
        "composite-coolants"
      ]
    },
    {
      "id": "continuum-index",
      "view": "research",
      "icon": "📚",
      "name": "Continuum Index",
      "desc": "Mission rewards x1.35, cooldowns -12%, and offline cap +2h.",
      "cost": 85000000000000,
      "costResearch": 160,
      "effects": {
        "multiply": {
          "missionReward": 1.35
        },
        "add": {
          "missionCooldownReduction": 0.12,
          "offlineCapHours": 2
        }
      },
      "visibleWhen": {
        "prestiges": 4
      },
      "branch": "Theory",
      "requires": [
        "moon-models",
        "autonomous-patching"
      ]
    },
    {
      "id": "failure-forecasting",
      "view": "research",
      "branch": "Security",
      "icon": "📉",
      "name": "Failure Forecasting",
      "desc": "Predict weak points before they get theatrical. Incident chance -7%, response +10%, and research x1.1.",
      "cost": 140000000,
      "costResearch": 15,
      "effects": {
        "add": {
          "incidentChanceReduction": 0.07,
          "responsePower": 0.1
        },
        "multiply": {
          "researchBonus": 1.1
        }
      },
      "visibleWhen": {
        "incidentsResolved": 4
      },
      "requires": [
        "autonomous-patching"
      ]
    },
    {
      "id": "adaptive-schedulers",
      "view": "research",
      "branch": "Ops",
      "icon": "🧭",
      "name": "Adaptive Schedulers",
      "desc": "Mission speed x1.18 and automated income x1.2.",
      "cost": 620000000,
      "costResearch": 22,
      "effects": {
        "multiply": {
          "missionSpeed": 1.18,
          "automatedIncome": 1.2
        }
      },
      "visibleWhen": {
        "missionsCompleted": 6
      },
      "requires": [
        "mission-simulators"
      ]
    },
    {
      "id": "superconducting-busways",
      "view": "research",
      "branch": "Materials",
      "icon": "🧲",
      "name": "Superconducting Busways",
      "desc": "Facilities x1.45, capacity +10%, and high-tier capacity use -6%.",
      "cost": 7800000000,
      "costResearch": 38,
      "effects": {
        "categoryMultiply": {
          "Facilities": 1.45
        },
        "add": {
          "capacityBonus": 0.1,
          "highTierCapacityReduction": 0.06
        }
      },
      "visibleWhen": {
        "unlockedRegion": "north"
      },
      "requires": [
        "composite-coolants"
      ]
    },
    {
      "id": "self-healing-fabric",
      "view": "research",
      "branch": "Security",
      "icon": "🩹",
      "name": "Self-Healing Fabric",
      "desc": "Automated income x1.25 and incidents get softer and shorter.",
      "cost": 68000000000,
      "costResearch": 58,
      "effects": {
        "multiply": {
          "automatedIncome": 1.25
        },
        "add": {
          "incidentSeverityReduction": 0.08,
          "incidentDurationReduction": 0.1
        }
      },
      "visibleWhen": {
        "incidentsResolved": 8
      },
      "requires": [
        "failure-forecasting"
      ]
    },
    {
      "id": "phase-array-labs",
      "view": "research",
      "branch": "Frontier",
      "icon": "📡",
      "name": "Phase Array Labs",
      "desc": "Frontier x1.5, mission rewards x1.12, and research x1.15.",
      "cost": 1400000000000,
      "costResearch": 96,
      "effects": {
        "categoryMultiply": {
          "Frontier": 1.5
        },
        "multiply": {
          "missionReward": 1.12,
          "researchBonus": 1.15
        }
      },
      "visibleWhen": {
        "highestTier": 11
      },
      "requires": [
        "moon-models"
      ]
    },
    {
      "id": "lattice-optimizers",
      "view": "research",
      "branch": "Theory",
      "icon": "🧠",
      "name": "Lattice Optimizers",
      "desc": "All income x1.45, mission cooldowns -8%, and research x1.2.",
      "cost": 260000000000000,
      "costResearch": 220,
      "effects": {
        "multiply": {
          "globalIncome": 1.45,
          "researchBonus": 1.2
        },
        "add": {
          "missionCooldownReduction": 0.08
        }
      },
      "visibleWhen": {
        "prestiges": 5
      },
      "requires": [
        "continuum-index"
      ]
    },
    {
      "id": "exo-materials",
      "view": "research",
      "branch": "Materials",
      "icon": "🪨",
      "name": "Exo-Materials Program",
      "desc": "Facilities and Frontier x1.35, capacity +14%.",
      "cost": 3200000000000000,
      "costResearch": 340,
      "effects": {
        "categoryMultiply": {
          "Facilities": 1.35,
          "Frontier": 1.35
        },
        "add": {
          "capacityBonus": 0.14
        }
      },
      "visibleWhen": {
        "unlockedRegion": "lunar"
      },
      "requires": [
        "superconducting-busways",
        "phase-array-labs"
      ]
    }
  ],
  "serviceDefs": [
    {
      "id": "msp-retainer",
      "icon": "☎️",
      "name": "MSP Retainer",
      "desc": "Always-on extra hands for small emergencies. Mission slots +1.",
      "cost": 125000,
      "effects": {
        "add": {
          "missionSlots": 1,
          "responsePower": 0.1
        }
      },
      "visibleWhen": {
        "managers": 2
      }
    },
    {
      "id": "managed-soc",
      "icon": "🛡️",
      "name": "Managed SOC",
      "desc": "Security incidents appear less often and resolve faster.",
      "cost": 2200000,
      "effects": {
        "add": {
          "incidentChanceReduction": 0.15,
          "incidentDurationReduction": 0.1
        }
      },
      "visibleWhen": {
        "lifetimeCredits": 800000
      }
    },
    {
      "id": "spare-parts",
      "icon": "🧰",
      "name": "Spare Parts Depot",
      "desc": "Drive failures and brownouts stop chewing through uptime.",
      "cost": 12000000,
      "effects": {
        "add": {
          "responsePower": 0.25
        },
        "categoryIncidentShield": {
          "Servers": 0.08,
          "Facilities": 0.08
        }
      },
      "visibleWhen": {
        "ownedId": {
          "id": "hall",
          "amount": 1
        }
      }
    },
    {
      "id": "forensics-lab",
      "icon": "🧫",
      "name": "Forensics Lab",
      "desc": "Mission research rewards x1.2 and incident severity down.",
      "cost": 45000000,
      "costResearch": 5,
      "effects": {
        "multiply": {
          "researchBonus": 1.2
        },
        "add": {
          "incidentSeverityReduction": 0.12
        }
      },
      "visibleWhen": {
        "incidentsResolved": 3
      }
    },
    {
      "id": "field-contractors",
      "icon": "🚚",
      "name": "Field Contractors",
      "desc": "Response power +35% and mission rewards x1.1.",
      "cost": 380000000,
      "effects": {
        "add": {
          "responsePower": 0.35
        },
        "multiply": {
          "missionReward": 1.1
        }
      },
      "visibleWhen": {
        "unlockedRegion": "euro"
      }
    },
    {
      "id": "chaos-monkeys",
      "icon": "🐒",
      "name": "Gentle Chaos Monkeys",
      "desc": "Oddly enough, training for chaos reduces incident chance by another 10%.",
      "cost": 2400000000,
      "costResearch": 12,
      "effects": {
        "add": {
          "incidentChanceReduction": 0.1,
          "responsePower": 0.15
        }
      },
      "visibleWhen": {
        "missionsCompleted": 10
      }
    },
    {
      "id": "expedition-broker",
      "icon": "🧭",
      "name": "Expedition Broker",
      "desc": "Elite missions unlock sooner and cooldowns shrink.",
      "cost": 18000000000,
      "costResearch": 24,
      "effects": {
        "add": {
          "missionCooldownReduction": 0.1
        },
        "multiply": {
          "missionReward": 1.08
        }
      },
      "visibleWhen": {
        "highestTier": 9
      }
    },
    {
      "id": "threat-intel-feed",
      "icon": "📰",
      "name": "Threat Intel Feed",
      "desc": "Incidents become milder and research pays slightly better.",
      "cost": 95000000000,
      "costResearch": 40,
      "effects": {
        "add": {
          "incidentSeverityReduction": 0.1,
          "incidentChanceReduction": 0.06
        },
        "multiply": {
          "researchBonus": 1.1
        }
      },
      "visibleWhen": {
        "incidentsResolved": 10
      }
    },
    {
      "id": "reliability-retainer",
      "icon": "🧯",
      "name": "Reliability Retainer",
      "desc": "Massive response boost for the late game.",
      "cost": 880000000000,
      "costResearch": 72,
      "effects": {
        "add": {
          "responsePower": 0.45,
          "incidentDurationReduction": 0.1
        }
      },
      "visibleWhen": {
        "unlockedRegion": "core"
      }
    },
    {
      "id": "incident-command",
      "icon": "🗺️",
      "name": "Incident Command Bench",
      "desc": "Response power +40%, mission speed x1.08, and boss incidents calm down faster.",
      "cost": 24000000000,
      "costResearch": 18,
      "effects": {
        "add": {
          "responsePower": 0.4,
          "incidentDurationReduction": 0.08
        },
        "multiply": {
          "missionSpeed": 1.08
        }
      },
      "visibleWhen": {
        "incidentsResolved": 6
      }
    },
    {
      "id": "blackstart-grid",
      "icon": "⚡",
      "name": "Blackstart Grid Contract",
      "desc": "Power and cooling incidents hurt less. Capacity +6% and incident shield thinking gets stronger.",
      "cost": 950000000000,
      "costResearch": 60,
      "effects": {
        "add": {
          "capacityBonus": 0.06,
          "incidentSeverityReduction": 0.08
        },
        "categoryIncidentShield": {
          "Facilities": 0.15,
          "Frontier": 0.12
        }
      },
      "visibleWhen": {
        "unlockedRegion": "core"
      }
    },
    {
      "id": "red-team-circle",
      "icon": "🕶️",
      "name": "Red Team Circle",
      "desc": "Security incidents appear less often, resolve faster, and research data pays slightly better.",
      "cost": 8800000000000,
      "costResearch": 96,
      "effects": {
        "add": {
          "incidentChanceReduction": 0.09,
          "incidentDurationReduction": 0.08,
          "incidentSeverityReduction": 0.06
        },
        "multiply": {
          "researchBonus": 1.08
        }
      },
      "visibleWhen": {
        "incidentsResolved": 14
      }
    }
  ],
  "incidentDefs": [
    {
      "id": "virus",
      "icon": "🦠",
      "name": "Virus Outbreak",
      "desc": "A very rude little piece of software starts chewing through workflows.",
      "baseDuration": 90,
      "visibleWhen": {
        "lifetimeCredits": 1000
      },
      "penalties": {
        "incomeMult": 0.9,
        "speedMult": 0.93
      },
      "tags": [
        "security"
      ]
    },
    {
      "id": "intrusion",
      "icon": "🥷",
      "name": "Intrusion Attempt",
      "desc": "A hostile actor pokes your perimeter until someone notices.",
      "baseDuration": 120,
      "visibleWhen": {
        "managers": 2
      },
      "penalties": {
        "automatedMult": 0.85,
        "offlineEfficiencyDelta": -0.08
      },
      "tags": [
        "security"
      ]
    },
    {
      "id": "drives",
      "icon": "💽",
      "name": "Failing Drive Batch",
      "desc": "Several disks decide retirement sounds amazing.",
      "baseDuration": 110,
      "visibleWhen": {
        "ownedCategory": {
          "category": "Servers",
          "amount": 30
        }
      },
      "penalties": {
        "categoryMult": {
          "Servers": 0.78
        }
      },
      "tags": [
        "hardware"
      ]
    },
    {
      "id": "packet",
      "icon": "🌩️",
      "name": "Packet Storm",
      "desc": "The network becomes a haunted raincloud of duplicate feelings.",
      "baseDuration": 95,
      "visibleWhen": {
        "ownedId": {
          "id": "switch",
          "amount": 8
        }
      },
      "penalties": {
        "categoryMult": {
          "Networking": 0.76
        },
        "speedMult": 0.92
      },
      "tags": [
        "network"
      ]
    },
    {
      "id": "cooling",
      "icon": "💧",
      "name": "Cooling Leak",
      "desc": "Somewhere, a pipe has developed a deeply personal grudge.",
      "baseDuration": 135,
      "visibleWhen": {
        "ownedId": {
          "id": "hall",
          "amount": 1
        }
      },
      "penalties": {
        "categoryMult": {
          "Facilities": 0.82,
          "Frontier": 0.82
        },
        "incomeMult": 0.93
      },
      "tags": [
        "facility"
      ]
    },
    {
      "id": "brownout",
      "icon": "🔋",
      "name": "Power Brownout",
      "desc": "Everything still works, but now it sounds worried.",
      "baseDuration": 80,
      "visibleWhen": {
        "unlockedRegion": "apac"
      },
      "penalties": {
        "incomeMult": 0.88,
        "speedMult": 0.9
      },
      "tags": [
        "facility"
      ]
    },
    {
      "id": "ransom",
      "icon": "🔐",
      "name": "Ransomware Lockup",
      "desc": "Backups are suddenly everyone’s favorite topic.",
      "baseDuration": 160,
      "visibleWhen": {
        "incidentsResolved": 2
      },
      "penalties": {
        "automatedMult": 0.78,
        "incomeMult": 0.9
      },
      "tags": [
        "security"
      ]
    },
    {
      "id": "backbone",
      "icon": "🧵",
      "name": "Backbone Flap",
      "desc": "Routes start wandering like they forgot their keys.",
      "baseDuration": 125,
      "visibleWhen": {
        "highestTier": 9
      },
      "penalties": {
        "categoryMult": {
          "Networking": 0.7,
          "Cloud": 0.86
        }
      },
      "tags": [
        "network"
      ]
    },
    {
      "id": "firmware",
      "icon": "🪛",
      "name": "Bad Firmware Push",
      "desc": "Someone patched production with opinions instead of testing.",
      "baseDuration": 145,
      "visibleWhen": {
        "highestTier": 10
      },
      "penalties": {
        "categoryMult": {
          "Servers": 0.8,
          "Cloud": 0.88
        },
        "speedMult": 0.93
      },
      "tags": [
        "hardware"
      ]
    },
    {
      "id": "cryo",
      "icon": "🧊",
      "name": "Cryo Plant Ice Jam",
      "desc": "The cooling plant invents a brand new emergency for you.",
      "baseDuration": 190,
      "visibleWhen": {
        "unlockedRegion": "north"
      },
      "penalties": {
        "categoryMult": {
          "Facilities": 0.72,
          "Frontier": 0.76
        },
        "incomeMult": 0.88
      },
      "tags": [
        "facility"
      ]
    },
    {
      "id": "worm",
      "icon": "🪱",
      "name": "Autonomous Worm Surge",
      "desc": "A self-propagating nightmare crawls across the empire and everybody starts saying “containment” in a tense voice.",
      "baseDuration": 260,
      "visibleWhen": {
        "incidentsResolved": 8,
        "highestTier": 10
      },
      "penalties": {
        "automatedMult": 0.65,
        "incomeMult": 0.82,
        "speedMult": 0.88
      },
      "tags": [
        "security",
        "boss"
      ],
      "boss": true,
      "weight": 0.28
    },
    {
      "id": "thermal-runaway",
      "icon": "🔥",
      "name": "Thermal Runaway Event",
      "desc": "Cooling and power both decide they are artists now. The art is panic.",
      "baseDuration": 320,
      "visibleWhen": {
        "unlockedRegion": "core"
      },
      "penalties": {
        "categoryMult": {
          "Facilities": 0.62,
          "Frontier": 0.7
        },
        "incomeMult": 0.82
      },
      "tags": [
        "facility",
        "boss"
      ],
      "boss": true,
      "weight": 0.24
    },
    {
      "id": "rogue-model",
      "icon": "🧠",
      "name": "Rogue Model Cascade",
      "desc": "A high-end training cluster invents a brand new form of expensive nonsense.",
      "baseDuration": 360,
      "visibleWhen": {
        "ownedId": {
          "id": "ai",
          "amount": 3
        },
        "prestiges": 3
      },
      "penalties": {
        "categoryMult": {
          "Frontier": 0.6,
          "Cloud": 0.82
        },
        "automatedMult": 0.7
      },
      "tags": [
        "frontier",
        "boss"
      ],
      "boss": true,
      "weight": 0.2
    },
    {
      "id": "solar-flare",
      "icon": "☀️",
      "name": "Solar Flare Routing Crisis",
      "desc": "Orbital links and long-haul routes get slapped around by the sky.",
      "baseDuration": 340,
      "visibleWhen": {
        "ownedId": {
          "id": "orbital",
          "amount": 1
        }
      },
      "penalties": {
        "categoryMult": {
          "Networking": 0.6,
          "Cloud": 0.72,
          "Frontier": 0.8
        },
        "speedMult": 0.84
      },
      "tags": [
        "network",
        "boss"
      ],
      "boss": true,
      "weight": 0.18
    }
  ],
  "questDefs": [
    {
      "id": "helpdesk",
      "icon": "🎫",
      "name": "Overflow Ticket Sweep",
      "desc": "Push through a wave of tickets for a tidy short-term payout.",
      "duration": 70,
      "cooldown": 45,
      "teams": 1,
      "rewards": {
        "creditsSec": 80,
        "research": 1
      },
      "visibleWhen": {
        "managers": 1
      },
      "kind": "profit",
      "tier": "Routine"
    },
    {
      "id": "migration",
      "icon": "🚚",
      "name": "Midnight Migration",
      "desc": "Move workloads with style and only a modest amount of panic.",
      "duration": 120,
      "cooldown": 80,
      "teams": 1,
      "rewards": {
        "creditsSec": 180,
        "research": 2
      },
      "visibleWhen": {
        "managers": 2
      },
      "kind": "hybrid",
      "tier": "Routine"
    },
    {
      "id": "audit",
      "icon": "🔐",
      "name": "Security Audit Sprint",
      "desc": "Hunt down weak points and get paid to feel clever.",
      "duration": 160,
      "cooldown": 110,
      "teams": 1,
      "rewards": {
        "creditsSec": 140,
        "research": 4,
        "incidentShield": 180
      },
      "visibleWhen": {
        "incidentsResolved": 1
      },
      "kind": "security",
      "tier": "Routine"
    },
    {
      "id": "colo-onboard",
      "icon": "🤝",
      "name": "Colocation Onboarding",
      "desc": "A new client, a new contract, and twelve new assumptions.",
      "duration": 240,
      "cooldown": 180,
      "teams": 2,
      "rewards": {
        "creditsSec": 420,
        "research": 3
      },
      "visibleWhen": {
        "ownedId": {
          "id": "colo",
          "amount": 1
        }
      },
      "kind": "profit",
      "tier": "Standard"
    },
    {
      "id": "r-and-d",
      "icon": "🧪",
      "name": "Prototype Research Sprint",
      "desc": "Investigate efficiencies, strange chips, and possibly the moon.",
      "duration": 220,
      "cooldown": 160,
      "teams": 2,
      "rewards": {
        "creditsSec": 120,
        "research": 8
      },
      "visibleWhen": {
        "unlockedRegion": "euro"
      },
      "kind": "research",
      "tier": "Standard"
    },
    {
      "id": "recovery",
      "icon": "🧯",
      "name": "Disaster Recovery Drill",
      "desc": "Pretend the world is on fire so it bothers you less later.",
      "duration": 200,
      "cooldown": 180,
      "teams": 2,
      "rewards": {
        "creditsSec": 180,
        "research": 4,
        "incidentShield": 360
      },
      "visibleWhen": {
        "managers": 4
      },
      "kind": "security",
      "tier": "Standard"
    },
    {
      "id": "noc-refresh",
      "icon": "🖥️",
      "name": "NOC Refresh Contract",
      "desc": "Replace aging monitoring walls and invoice aggressively.",
      "duration": 260,
      "cooldown": 220,
      "teams": 2,
      "rewards": {
        "creditsSec": 560,
        "research": 5
      },
      "visibleWhen": {
        "unlockedRegion": "useast"
      },
      "kind": "profit",
      "tier": "Standard"
    },
    {
      "id": "peering-deal",
      "icon": "🔀",
      "name": "Peering Deal Negotiation",
      "desc": "Fewer hops, fatter contracts, better graphs.",
      "duration": 320,
      "cooldown": 260,
      "teams": 2,
      "rewards": {
        "creditsSec": 750,
        "research": 6
      },
      "visibleWhen": {
        "ownedId": {
          "id": "regional",
          "amount": 1
        }
      },
      "kind": "profit",
      "tier": "Advanced"
    },
    {
      "id": "chaos-drill",
      "icon": "🐒",
      "name": "Chaos Engineering Drill",
      "desc": "Break little things on purpose so the big things stop doing it for free.",
      "duration": 300,
      "cooldown": 260,
      "teams": 2,
      "rewards": {
        "creditsSec": 280,
        "research": 10,
        "incidentShield": 540
      },
      "visibleWhen": {
        "incidentsResolved": 5
      },
      "kind": "security",
      "tier": "Advanced"
    },
    {
      "id": "supply-chain",
      "icon": "📦",
      "name": "Supply Chain Recon",
      "desc": "Lock in parts, logistics, and a few hard-won margins.",
      "duration": 360,
      "cooldown": 300,
      "teams": 2,
      "rewards": {
        "creditsSec": 820,
        "research": 8
      },
      "visibleWhen": {
        "ownedId": {
          "id": "hall",
          "amount": 3
        }
      },
      "kind": "profit",
      "tier": "Advanced"
    },
    {
      "id": "fabric-lab",
      "icon": "🧬",
      "name": "Fabric Research Program",
      "desc": "A deep theory mission that actually teaches the empire something useful.",
      "duration": 420,
      "cooldown": 320,
      "teams": 3,
      "rewards": {
        "creditsSec": 320,
        "research": 16,
        "ipShards": 1
      },
      "visibleWhen": {
        "research": 12
      },
      "kind": "research",
      "tier": "Advanced"
    },
    {
      "id": "ai-benchmark",
      "icon": "🤖",
      "name": "AI Benchmark Contract",
      "desc": "Train, test, invoice, repeat.",
      "duration": 360,
      "cooldown": 320,
      "teams": 3,
      "rewards": {
        "creditsSec": 900,
        "research": 6,
        "ipShards": 1
      },
      "visibleWhen": {
        "ownedId": {
          "id": "ai",
          "amount": 1
        }
      },
      "kind": "profit",
      "tier": "Advanced"
    },
    {
      "id": "orbital-sync",
      "icon": "🛰️",
      "name": "Orbital Sync Window",
      "desc": "A delicate contract that pays well and hates being rushed.",
      "duration": 520,
      "cooldown": 440,
      "teams": 3,
      "rewards": {
        "creditsSec": 1700,
        "research": 12,
        "ipShards": 1
      },
      "visibleWhen": {
        "ownedId": {
          "id": "orbital",
          "amount": 1
        }
      },
      "kind": "hybrid",
      "tier": "Elite"
    },
    {
      "id": "quantum-probe",
      "icon": "⚛️",
      "name": "Quantum Stability Probe",
      "desc": "Expensive science with excellent bragging rights.",
      "duration": 680,
      "cooldown": 520,
      "teams": 4,
      "rewards": {
        "creditsSec": 2200,
        "research": 24,
        "ipShards": 2
      },
      "visibleWhen": {
        "ownedId": {
          "id": "quantum",
          "amount": 1
        }
      },
      "kind": "research",
      "tier": "Elite"
    },
    {
      "id": "global-failover",
      "icon": "🌍",
      "name": "Global Failover Exercise",
      "desc": "Massive drills, bigger confidence, healthy invoice.",
      "duration": 640,
      "cooldown": 500,
      "teams": 4,
      "rewards": {
        "creditsSec": 2400,
        "research": 18,
        "incidentShield": 900
      },
      "visibleWhen": {
        "unlockedRegion": "core"
      },
      "kind": "security",
      "tier": "Elite"
    },
    {
      "id": "moon-market",
      "icon": "🌕",
      "name": "Lunar Sovereign Contract",
      "desc": "Moon-based enterprise clients arrive with absurd budgets.",
      "duration": 780,
      "cooldown": 640,
      "teams": 4,
      "rewards": {
        "creditsSec": 4200,
        "research": 22,
        "ipShards": 2
      },
      "visibleWhen": {
        "unlockedRegion": "lunar"
      },
      "kind": "profit",
      "tier": "Elite"
    },
    {
      "id": "dark-fiber",
      "icon": "🌌",
      "name": "Dark Fiber Initiative",
      "desc": "A late-game networking monster with an equally monstrous cooldown.",
      "duration": 900,
      "cooldown": 780,
      "teams": 5,
      "rewards": {
        "creditsSec": 5800,
        "research": 26,
        "ipShards": 2
      },
      "visibleWhen": {
        "highestTier": 13
      },
      "kind": "profit",
      "tier": "Legendary"
    },
    {
      "id": "lunar-black",
      "icon": "🌕",
      "name": "Lunar Black-Site Research",
      "desc": "Moon-based experiments that make investors whisper.",
      "duration": 520,
      "cooldown": 380,
      "teams": 3,
      "rewards": {
        "creditsSec": 1400,
        "research": 15,
        "ipShards": 2
      },
      "visibleWhen": {
        "unlockedRegion": "lunar"
      },
      "kind": "research",
      "tier": "Elite"
    },
    {
      "id": "continuum",
      "icon": "🌀",
      "name": "Continuum Calibration",
      "desc": "Ridiculous next-gen tuning for players who have already gone too far to stop now.",
      "duration": 1200,
      "cooldown": 960,
      "teams": 5,
      "rewards": {
        "creditsSec": 7600,
        "research": 36,
        "ipShards": 3
      },
      "visibleWhen": {
        "ownedId": {
          "id": "quantum",
          "amount": 3
        },
        "prestiges": 5
      },
      "kind": "research",
      "tier": "Mythic"
    },
    {
      "id": "fleet-orchestration",
      "icon": "🧩",
      "name": "Fleet Orchestration Rollout",
      "desc": "A giant scheduling project that pays in credibility, contracts, and cleaner graphs.",
      "duration": 780,
      "cooldown": 720,
      "teams": 4,
      "rewards": {
        "creditsSec": 3600,
        "research": 18,
        "ipShards": 1
      },
      "visibleWhen": {
        "highestTier": 11
      },
      "kind": "hybrid",
      "tier": "Legendary"
    },
    {
      "id": "deep-vault-theorem",
      "icon": "📚",
      "name": "Deep Vault Theorem",
      "desc": "A prestige-grade research expedition into weird chips, colder math, and questionable coffee.",
      "duration": 980,
      "cooldown": 920,
      "teams": 5,
      "rewards": {
        "creditsSec": 4200,
        "research": 40,
        "ipShards": 3
      },
      "visibleWhen": {
        "research": 80,
        "prestiges": 4
      },
      "kind": "research",
      "tier": "Mythic"
    },
    {
      "id": "planetary-twin",
      "icon": "🌍",
      "name": "Planetary Twin Failover",
      "desc": "Stand up mirrored regions so cleanly it looks like sorcery to finance.",
      "duration": 1120,
      "cooldown": 1080,
      "teams": 5,
      "rewards": {
        "creditsSec": 5200,
        "research": 28,
        "incidentShield": 1200,
        "ipShards": 2
      },
      "visibleWhen": {
        "unlockedRegions": 7
      },
      "kind": "security",
      "tier": "Mythic"
    },
    {
      "id": "red-planet-tender",
      "icon": "🪐",
      "name": "Red Planet Tender",
      "desc": "A future-facing compute bid with ridiculous margins and even more ridiculous requirements.",
      "duration": 1360,
      "cooldown": 1320,
      "teams": 6,
      "rewards": {
        "creditsSec": 7600,
        "research": 34,
        "ipShards": 3
      },
      "visibleWhen": {
        "highestTier": 13,
        "prestiges": 6
      },
      "kind": "profit",
      "tier": "Apex"
    },
    {
      "id": "sovereign-cache",
      "icon": "🏦",
      "name": "Sovereign Cache Vault",
      "desc": "Build a secure archival platform for clients who think latency is a personality trait.",
      "duration": 1540,
      "cooldown": 1440,
      "teams": 6,
      "rewards": {
        "creditsSec": 9200,
        "research": 46,
        "ipShards": 4
      },
      "visibleWhen": {
        "unlockedRegion": "lunar",
        "missionsCompleted": 20
      },
      "kind": "profit",
      "tier": "Apex"
    },
    {
      "id": "chrono-brokerage",
      "icon": "⏳",
      "name": "Chrono Brokerage Window",
      "desc": "An absurd next-gen timing contract that only the far-gone should attempt.",
      "duration": 1800,
      "cooldown": 1700,
      "teams": 7,
      "rewards": {
        "creditsSec": 12400,
        "research": 60,
        "ipShards": 5
      },
      "visibleWhen": {
        "ownedId": {
          "id": "quantum",
          "amount": 6
        },
        "prestiges": 8
      },
      "kind": "research",
      "tier": "Transcendent"
    }
  ],
  "specialistDefs": [
    {
      "id": "night-shift",
      "rarity": "common",
      "icon": "🌙",
      "name": "Night Shift Eli",
      "desc": "Offline earnings efficiency +10%.",
      "cost": 15000,
      "effects": {
        "add": {
          "offlineEfficiency": 0.1
        }
      },
      "visibleWhen": {
        "managers": 1
      }
    },
    {
      "id": "procurement",
      "rarity": "rare",
      "icon": "🧾",
      "name": "Procurement Chief Tessa",
      "desc": "All infrastructure costs -8%.",
      "cost": 220000,
      "effects": {
        "add": {
          "costReduction": 0.08
        }
      },
      "visibleWhen": {
        "managers": 2
      }
    },
    {
      "id": "cooling",
      "rarity": "rare",
      "icon": "🧊",
      "name": "Cooling Specialist Leon",
      "desc": "Total capacity +12%.",
      "cost": 1750000,
      "effects": {
        "add": {
          "capacityBonus": 0.12
        }
      },
      "visibleWhen": {
        "unlockedRegion": "useast"
      }
    },
    {
      "id": "devops",
      "rarity": "rare",
      "icon": "🛠️",
      "name": "DevOps Lead Ren",
      "desc": "All cycle speeds +15%.",
      "cost": 3800000,
      "effects": {
        "multiply": {
          "speed": 1.15
        }
      },
      "visibleWhen": {
        "managers": 4
      }
    },
    {
      "id": "sre-sigma",
      "rarity": "legendary",
      "icon": "🛡️",
      "name": "SRE Team Sigma",
      "desc": "All automated infrastructure income x2.",
      "cost": 28000000,
      "effects": {
        "multiply": {
          "automatedIncome": 2
        }
      },
      "visibleWhen": {
        "managers": 5
      }
    },
    {
      "id": "architect",
      "rarity": "legendary",
      "icon": "📐",
      "name": "Chief Architect Vega",
      "desc": "All income x1.5 and capacity +10%.",
      "cost": 1600000000,
      "effects": {
        "multiply": {
          "globalIncome": 1.5
        },
        "add": {
          "capacityBonus": 0.1
        }
      },
      "visibleWhen": {
        "ownedId": {
          "id": "regional",
          "amount": 1
        }
      }
    },
    {
      "id": "director-nyx",
      "rarity": "legendary",
      "icon": "🌌",
      "name": "Director Nyx",
      "desc": "Starting credits on each run +50K and automated income x1.5.",
      "cost": 95000000000,
      "effects": {
        "add": {
          "startingCredits": 50000
        },
        "multiply": {
          "automatedIncome": 1.5
        }
      },
      "visibleWhen": {
        "prestigePoints": 5
      }
    },
    {
      "id": "socradar",
      "rarity": "rare",
      "icon": "🚨",
      "name": "Security Lead Ivo",
      "desc": "Incident chance -10% and response power +15%.",
      "cost": 8500000,
      "effects": {
        "add": {
          "incidentChanceReduction": 0.1,
          "responsePower": 0.15
        }
      },
      "visibleWhen": {
        "incidentsResolved": 1
      }
    },
    {
      "id": "dispatch",
      "rarity": "rare",
      "icon": "📬",
      "name": "Dispatch Chief Zara",
      "desc": "Mission speed x1.15 and rewards x1.1.",
      "cost": 42000000,
      "effects": {
        "multiply": {
          "missionSpeed": 1.15,
          "missionReward": 1.1
        }
      },
      "visibleWhen": {
        "missionsCompleted": 3
      }
    },
    {
      "id": "backup-sage",
      "rarity": "legendary",
      "icon": "🪄",
      "name": "Backup Sage Moth",
      "desc": "Incident severity drops and research rewards x1.25.",
      "cost": 1800000000,
      "effects": {
        "add": {
          "incidentSeverityReduction": 0.15
        },
        "multiply": {
          "researchBonus": 1.25
        }
      },
      "visibleWhen": {
        "missionsCompleted": 8
      }
    },
    {
      "id": "moon-analyst",
      "rarity": "legendary",
      "icon": "🌔",
      "name": "Lunar Analyst Sao",
      "desc": "Research rewards x1.4 and mission cooldowns -8%.",
      "cost": 4600000000000,
      "effects": {
        "multiply": {
          "researchBonus": 1.4
        },
        "add": {
          "missionCooldownReduction": 0.08
        }
      },
      "visibleWhen": {
        "unlockedRegion": "lunar"
      }
    },
    {
      "id": "reliability-falcon",
      "rarity": "legendary",
      "icon": "🦅",
      "name": "Reliability Falcon",
      "desc": "Response power +25%, incident chance -6%, and automated income x1.2.",
      "cost": 980000000000,
      "effects": {
        "add": {
          "responsePower": 0.25,
          "incidentChanceReduction": 0.06
        },
        "multiply": {
          "automatedIncome": 1.2
        }
      },
      "visibleWhen": {
        "incidentsResolved": 8
      }
    }
  ],
  "prestigeNodeDefs": [
    {
      "id": "p-global-1",
      "branch": "Hardware",
      "icon": "🔧",
      "name": "Refit Blueprints",
      "desc": "All income +25%.",
      "cost": 1,
      "maxLevel": 1,
      "effects": {
        "add": {
          "prestigeIncomeBonus": 0.25
        }
      }
    },
    {
      "id": "p-cost-1",
      "branch": "Hardware",
      "icon": "💰",
      "name": "Bulk Procurement",
      "desc": "All costs -5%.",
      "cost": 2,
      "maxLevel": 1,
      "effects": {
        "add": {
          "costReduction": 0.05
        }
      },
      "requires": [
        "p-global-1"
      ]
    },
    {
      "id": "p-speed-1",
      "branch": "Networking",
      "icon": "⚡",
      "name": "Edge Routing",
      "desc": "Cycle speed +12%.",
      "cost": 2,
      "maxLevel": 1,
      "effects": {
        "multiply": {
          "speed": 1.12
        }
      }
    },
    {
      "id": "p-offline-1",
      "branch": "Networking",
      "icon": "🕒",
      "name": "Durable Checkpoints",
      "desc": "Offline cap +2 hours and efficiency +10%.",
      "cost": 2,
      "maxLevel": 1,
      "effects": {
        "add": {
          "offlineCapHours": 2,
          "offlineEfficiency": 0.1
        }
      },
      "requires": [
        "p-speed-1"
      ]
    },
    {
      "id": "p-auto-1",
      "branch": "Automation",
      "icon": "🤝",
      "name": "Manager Training",
      "desc": "Managers cost -10%.",
      "cost": 2,
      "maxLevel": 1,
      "effects": {
        "add": {
          "managerDiscount": 0.1
        }
      }
    },
    {
      "id": "p-auto-2",
      "branch": "Automation",
      "icon": "📡",
      "name": "Hands-Off Doctrine",
      "desc": "Automated income x1.5.",
      "cost": 3,
      "maxLevel": 1,
      "effects": {
        "multiply": {
          "automatedIncome": 1.5
        }
      },
      "requires": [
        "p-auto-1"
      ]
    },
    {
      "id": "p-capacity-1",
      "branch": "Energy & Facilities",
      "icon": "🏗️",
      "name": "Modular Power Feeds",
      "desc": "Total capacity +15%.",
      "cost": 2,
      "maxLevel": 1,
      "effects": {
        "add": {
          "capacityBonus": 0.15
        }
      }
    },
    {
      "id": "p-capacity-2",
      "branch": "Energy & Facilities",
      "icon": "🧯",
      "name": "Cooling Overhead",
      "desc": "High-tier capacity use -10%.",
      "cost": 3,
      "maxLevel": 1,
      "effects": {
        "add": {
          "highTierCapacityReduction": 0.1
        }
      },
      "requires": [
        "p-capacity-1"
      ]
    },
    {
      "id": "p-region-1",
      "branch": "Energy & Facilities",
      "icon": "🗺️",
      "name": "Expansion Playbooks",
      "desc": "Region costs -12%.",
      "cost": 3,
      "maxLevel": 1,
      "effects": {
        "add": {
          "regionCostReduction": 0.12
        }
      },
      "requires": [
        "p-capacity-1"
      ]
    },
    {
      "id": "p-frontier-1",
      "branch": "Future Tech",
      "icon": "🧬",
      "name": "AI Fabric",
      "desc": "Frontier income x2.",
      "cost": 4,
      "maxLevel": 1,
      "effects": {
        "categoryMultiply": {
          "Frontier": 2
        }
      }
    },
    {
      "id": "p-starting-1",
      "branch": "Future Tech",
      "icon": "🎒",
      "name": "Migration Head Start",
      "desc": "Start each run with 250K credits.",
      "cost": 4,
      "maxLevel": 1,
      "effects": {
        "add": {
          "startingCredits": 250000
        }
      },
      "requires": [
        "p-frontier-1"
      ]
    },
    {
      "id": "p-cloud-1",
      "branch": "Future Tech",
      "icon": "☁️",
      "name": "Cloud Templates",
      "desc": "Cloud income x2.",
      "cost": 3,
      "maxLevel": 1,
      "effects": {
        "categoryMultiply": {
          "Cloud": 2
        }
      },
      "requires": [
        "p-frontier-1"
      ]
    },
    {
      "id": "p-incident-1",
      "branch": "Automation",
      "icon": "🚨",
      "name": "Incident Simulators",
      "desc": "Incident chance -10% and response power +15%.",
      "cost": 3,
      "maxLevel": 1,
      "effects": {
        "add": {
          "incidentChanceReduction": 0.1,
          "responsePower": 0.15
        }
      },
      "requires": [
        "p-auto-1"
      ]
    },
    {
      "id": "p-mission-1",
      "branch": "Future Tech",
      "icon": "🛰️",
      "name": "Ops Expedition Pods",
      "desc": "Mission slots +1 and mission speed x1.1.",
      "cost": 5,
      "maxLevel": 1,
      "effects": {
        "add": {
          "missionSlots": 1
        },
        "multiply": {
          "missionSpeed": 1.1
        }
      },
      "requires": [
        "p-frontier-1"
      ]
    },
    {
      "id": "p-research-1",
      "branch": "Future Tech",
      "icon": "🔬",
      "name": "Meta-Labs",
      "desc": "Research rewards x1.3.",
      "cost": 5,
      "maxLevel": 1,
      "effects": {
        "multiply": {
          "researchBonus": 1.3
        }
      },
      "requires": [
        "p-mission-1"
      ]
    },
    {
      "id": "p-office-1",
      "branch": "Energy & Facilities",
      "icon": "🪑",
      "name": "Executive Remodeling",
      "desc": "Office slots +1 and capacity +8%.",
      "cost": 6,
      "maxLevel": 1,
      "effects": {
        "add": {
          "capacityBonus": 0.08,
          "officeSlotsBonus": 1
        }
      },
      "requires": [
        "p-capacity-1"
      ]
    },
    {
      "id": "p-war-room-1",
      "branch": "Automation",
      "icon": "📣",
      "name": "War Room Protocols",
      "desc": "Cooldowns -10% and response power +10%.",
      "cost": 6,
      "maxLevel": 1,
      "effects": {
        "add": {
          "missionCooldownReduction": 0.1,
          "responsePower": 0.1
        }
      },
      "requires": [
        "p-incident-1"
      ]
    },
    {
      "id": "p-research-2",
      "branch": "Future Tech",
      "icon": "📚",
      "name": "Archive of Strange Chips",
      "desc": "Research rewards x1.2 and mission rewards x1.1.",
      "cost": 8,
      "maxLevel": 1,
      "effects": {
        "multiply": {
          "researchBonus": 1.2,
          "missionReward": 1.1
        }
      },
      "requires": [
        "p-research-1"
      ]
    },
    {
      "id": "p-repeat-income",
      "branch": "Hardware",
      "icon": "📈",
      "name": "Compound Throughput",
      "desc": "Repeatable. All income +18% per level.",
      "cost": 6,
      "costGrowth": 1.82,
      "maxLevel": 60,
      "effects": {
        "add": {
          "prestigeIncomeBonus": 0.18
        }
      },
      "requires": [
        "p-cost-1"
      ]
    },
    {
      "id": "p-repeat-speed",
      "branch": "Networking",
      "icon": "⚙️",
      "name": "Latency Compression",
      "desc": "Repeatable. Cycle speed x1.08 per level.",
      "cost": 5,
      "costGrowth": 1.7,
      "maxLevel": 35,
      "effects": {
        "multiply": {
          "speed": 1.08
        }
      },
      "requires": [
        "p-offline-1"
      ]
    },
    {
      "id": "p-repeat-auto",
      "branch": "Automation",
      "icon": "🤖",
      "name": "Autopilot Lattice",
      "desc": "Repeatable. Automated income x1.15 per level.",
      "cost": 7,
      "costGrowth": 1.86,
      "maxLevel": 55,
      "effects": {
        "multiply": {
          "automatedIncome": 1.15
        }
      },
      "requires": [
        "p-auto-2"
      ]
    },
    {
      "id": "p-repeat-cap",
      "branch": "Energy & Facilities",
      "icon": "🏢",
      "name": "Megawatt Annexes",
      "desc": "Repeatable. Capacity +12% per level.",
      "cost": 7,
      "costGrowth": 1.88,
      "maxLevel": 44,
      "effects": {
        "add": {
          "capacityBonus": 0.12
        }
      },
      "requires": [
        "p-region-1"
      ]
    },
    {
      "id": "p-repeat-mission",
      "branch": "Future Tech",
      "icon": "📋",
      "name": "Black Budget Expeditions",
      "desc": "Repeatable. Mission rewards x1.12 and cooldowns -4% per level.",
      "cost": 10,
      "costGrowth": 1.94,
      "maxLevel": 40,
      "effects": {
        "multiply": {
          "missionReward": 1.12
        },
        "add": {
          "missionCooldownReduction": 0.04
        }
      },
      "requires": [
        "p-mission-1"
      ]
    },
    {
      "id": "p-repeat-research",
      "branch": "Future Tech",
      "icon": "🧪",
      "name": "Recursive Research",
      "desc": "Repeatable. Research rewards x1.18 per level.",
      "cost": 10,
      "costGrowth": 1.96,
      "maxLevel": 40,
      "effects": {
        "multiply": {
          "researchBonus": 1.18
        }
      },
      "requires": [
        "p-research-2"
      ]
    },
    {
      "id": "p-repeat-shield",
      "branch": "Automation",
      "icon": "🛡️",
      "name": "Resilience Doctrine",
      "desc": "Repeatable. Incident chance -2% and response power +4% per level.",
      "cost": 9,
      "costGrowth": 1.85,
      "maxLevel": 25,
      "effects": {
        "add": {
          "incidentChanceReduction": 0.02,
          "responsePower": 0.04
        }
      },
      "requires": [
        "p-war-room-1"
      ]
    },
    {
      "id": "p-repeat-headstart",
      "branch": "Hardware",
      "icon": "💼",
      "name": "Aggressive Reinvestment",
      "desc": "Repeatable. Starting credits +250K per level.",
      "cost": 11,
      "costGrowth": 1.95,
      "maxLevel": 20,
      "effects": {
        "add": {
          "startingCredits": 250000
        }
      },
      "requires": [
        "p-repeat-income"
      ]
    },
    {
      "id": "p-repeat-frontier",
      "branch": "Future Tech",
      "icon": "🚀",
      "name": "Frontier Escalation",
      "desc": "Repeatable. Frontier income x1.14 per level.",
      "cost": 12,
      "costGrowth": 1.98,
      "maxLevel": 34,
      "effects": {
        "categoryMultiply": {
          "Frontier": 1.14
        }
      },
      "requires": [
        "p-frontier-1"
      ]
    },
    {
      "id": "p-repeat-cloud",
      "branch": "Networking",
      "icon": "☁️",
      "name": "Elastic Weather",
      "desc": "Repeatable. Cloud income x1.13 per level.",
      "cost": 10,
      "costGrowth": 1.84,
      "maxLevel": 22,
      "effects": {
        "categoryMultiply": {
          "Cloud": 1.13
        }
      },
      "requires": [
        "p-cloud-1"
      ]
    },
    {
      "id": "p-repeat-servers",
      "branch": "Hardware",
      "icon": "🖥️",
      "name": "Dense Silicon",
      "desc": "Repeatable. Servers income x1.13 per level.",
      "cost": 10,
      "costGrowth": 1.84,
      "maxLevel": 22,
      "effects": {
        "categoryMultiply": {
          "Servers": 1.13
        }
      },
      "requires": [
        "p-global-1"
      ]
    },
    {
      "id": "p-repeat-facilities",
      "branch": "Energy & Facilities",
      "icon": "🏭",
      "name": "Stacked Cooling Towers",
      "desc": "Repeatable. Facilities income x1.13 per level.",
      "cost": 10,
      "costGrowth": 1.84,
      "maxLevel": 22,
      "effects": {
        "categoryMultiply": {
          "Facilities": 1.13
        }
      },
      "requires": [
        "p-capacity-2"
      ]
    },
    {
      "id": "p-research-3",
      "branch": "Future Tech",
      "icon": "🧬",
      "name": "Moonshot Index",
      "desc": "Research rewards x1.35 and Frontier x1.25.",
      "cost": 14,
      "maxLevel": 1,
      "effects": {
        "multiply": {
          "researchBonus": 1.35
        },
        "categoryMultiply": {
          "Frontier": 1.25
        }
      },
      "requires": [
        "p-research-2"
      ]
    },
    {
      "id": "p-war-room-2",
      "branch": "Automation",
      "icon": "📟",
      "name": "Command Net",
      "desc": "Response power +18% and mission speed x1.08.",
      "cost": 14,
      "maxLevel": 1,
      "effects": {
        "add": {
          "responsePower": 0.18
        },
        "multiply": {
          "missionSpeed": 1.08
        }
      },
      "requires": [
        "p-war-room-1"
      ]
    },
    {
      "id": "p-office-2",
      "branch": "Energy & Facilities",
      "icon": "🖼️",
      "name": "Gallery of Uptime",
      "desc": "Office slots +2 and global income +6%.",
      "cost": 16,
      "maxLevel": 1,
      "effects": {
        "add": {
          "officeSlotsBonus": 2
        },
        "multiply": {
          "globalIncome": 1.06
        }
      },
      "requires": [
        "p-office-1"
      ]
    },
    {
      "id": "p-boss-drills",
      "branch": "Automation",
      "icon": "🚨",
      "name": "Boss Incident Drills",
      "desc": "Incident severity down further and response power rises.",
      "cost": 18,
      "maxLevel": 1,
      "effects": {
        "add": {
          "incidentSeverityReduction": 0.1,
          "responsePower": 0.2
        }
      },
      "requires": [
        "p-war-room-2"
      ]
    },
    {
      "id": "p-repeat-network",
      "branch": "Networking",
      "icon": "🕸️",
      "name": "Waveguide Stacking",
      "desc": "Repeatable. Networking income x1.14 per level.",
      "cost": 12,
      "costGrowth": 1.88,
      "maxLevel": 32,
      "effects": {
        "categoryMultiply": {
          "Networking": 1.14
        }
      },
      "requires": [
        "p-speed-1"
      ]
    },
    {
      "id": "p-repeat-resilience",
      "branch": "Automation",
      "icon": "🧯",
      "name": "Incident Doctrine",
      "desc": "Repeatable. Incident chance -2.5% and duration -3% per level.",
      "cost": 12,
      "costGrowth": 1.9,
      "maxLevel": 28,
      "effects": {
        "add": {
          "incidentChanceReduction": 0.025,
          "incidentDurationReduction": 0.03
        }
      },
      "requires": [
        "p-boss-drills"
      ]
    },
    {
      "id": "p-repeat-offline",
      "branch": "Networking",
      "icon": "🌙",
      "name": "Dark Shift Logistics",
      "desc": "Repeatable. Offline efficiency +4% and cap +1h per level.",
      "cost": 14,
      "costGrowth": 1.92,
      "maxLevel": 24,
      "effects": {
        "add": {
          "offlineEfficiency": 0.04,
          "offlineCapHours": 1
        }
      },
      "requires": [
        "p-offline-1"
      ]
    },
    {
      "id": "p-repeat-rd",
      "branch": "Future Tech",
      "icon": "📚",
      "name": "Recursive Archives",
      "desc": "Repeatable. Research rewards x1.16 per level and mission rewards x1.05.",
      "cost": 15,
      "costGrowth": 1.94,
      "maxLevel": 28,
      "effects": {
        "multiply": {
          "researchBonus": 1.16,
          "missionReward": 1.05
        }
      },
      "requires": [
        "p-research-3"
      ]
    },
    {
      "id": "p-repeat-quantum",
      "branch": "Future Tech",
      "icon": "⚛️",
      "name": "Quantum Dividend",
      "desc": "Repeatable. Frontier x1.16 and global income +6% per level.",
      "cost": 18,
      "costGrowth": 1.98,
      "maxLevel": 26,
      "effects": {
        "categoryMultiply": {
          "Frontier": 1.16
        },
        "add": {
          "prestigeIncomeBonus": 0.06
        }
      },
      "requires": [
        "p-frontier-1"
      ]
    },
    {
      "id": "p-repeat-missionslots",
      "branch": "Automation",
      "icon": "👥",
      "name": "Parallel Ops Doctrine",
      "desc": "Repeatable. +1 mission team every level.",
      "cost": 22,
      "costGrowth": 2.08,
      "maxLevel": 12,
      "effects": {
        "add": {
          "missionSlots": 1
        }
      },
      "requires": [
        "p-mission-1"
      ]
    },
    {
      "id": "p-repeat-office",
      "branch": "Energy & Facilities",
      "icon": "🏙️",
      "name": "Luxury Command Campus",
      "desc": "Repeatable. Office slots +1 and capacity +5% per level.",
      "cost": 20,
      "costGrowth": 2.02,
      "maxLevel": 14,
      "effects": {
        "add": {
          "officeSlotsBonus": 1,
          "capacityBonus": 0.05
        }
      },
      "requires": [
        "p-office-2"
      ]
    },
    {
      "id": "p-repeat-mega-income",
      "branch": "Hardware",
      "icon": "🌋",
      "name": "Volcanic Throughput",
      "desc": "Repeatable. All income +30% per level. Expensive on purpose.",
      "cost": 28,
      "costGrowth": 2.15,
      "maxLevel": 45,
      "effects": {
        "add": {
          "prestigeIncomeBonus": 0.3
        }
      },
      "requires": [
        "p-repeat-income"
      ]
    },
    {
      "id": "p-repeat-credits2",
      "branch": "Hardware",
      "icon": "💼",
      "name": "Absurd Head Start",
      "desc": "Repeatable. Starting credits +2M per level.",
      "cost": 24,
      "costGrowth": 2.1,
      "maxLevel": 24,
      "effects": {
        "add": {
          "startingCredits": 2000000
        }
      },
      "requires": [
        "p-repeat-headstart"
      ]
    }
  ],
  "achievementDefs": [
    {
      "id": "a-first-boot",
      "icon": "🔌",
      "name": "First Boot",
      "desc": "Own 1 Home Lab Node.",
      "condition": {
        "ownedId": {
          "id": "home",
          "amount": 1
        }
      },
      "reward": {
        "credits": 25
      }
    },
    {
      "id": "a-first-manager",
      "icon": "🧑‍💼",
      "name": "Someone Else Can Click Now",
      "desc": "Hire your first manager.",
      "condition": {
        "managers": 1
      },
      "reward": {
        "credits": 1000
      }
    },
    {
      "id": "a-ten-racks",
      "icon": "🗄️",
      "name": "Server Smell",
      "desc": "Own 10 Small Server Racks.",
      "condition": {
        "ownedId": {
          "id": "rack",
          "amount": 10
        }
      },
      "reward": {
        "credits": 4000
      }
    },
    {
      "id": "a-managers",
      "icon": "🧑‍💼",
      "name": "Middle Management",
      "desc": "Hire 5 managers.",
      "condition": {
        "managers": 5
      },
      "reward": {
        "credits": 120000,
        "research": 1
      }
    },
    {
      "id": "a-region-hop",
      "icon": "🗺️",
      "name": "Footprint Expands",
      "desc": "Unlock 3 regions.",
      "condition": {
        "unlockedRegions": 3
      },
      "reward": {
        "credits": 2200000,
        "research": 2
      }
    },
    {
      "id": "a-billion",
      "icon": "💸",
      "name": "Serious Numbers",
      "desc": "Reach 1B lifetime Compute Credits.",
      "condition": {
        "lifetimeCredits": 1000000000
      },
      "reward": {
        "research": 4
      }
    },
    {
      "id": "a-first-fire",
      "icon": "🧯",
      "name": "Tiny Fire Drill",
      "desc": "Resolve your first incident.",
      "condition": {
        "incidentsResolved": 1
      },
      "reward": {
        "credits": 750000,
        "research": 2
      }
    },
    {
      "id": "a-five-fires",
      "icon": "🚒",
      "name": "Fire Marshal of Tiny Problems",
      "desc": "Resolve 5 incidents.",
      "condition": {
        "incidentsResolved": 5
      },
      "reward": {
        "credits": 6000000,
        "research": 4
      }
    },
    {
      "id": "a-mission-runner",
      "icon": "📋",
      "name": "On The Board",
      "desc": "Complete 3 missions.",
      "condition": {
        "missionsCompleted": 3
      },
      "reward": {
        "credits": 1800000,
        "research": 2
      }
    },
    {
      "id": "a-ops-habit",
      "icon": "📈",
      "name": "Ops Habit",
      "desc": "Complete 10 missions.",
      "condition": {
        "missionsCompleted": 10
      },
      "reward": {
        "research": 6,
        "ip": 1
      }
    },
    {
      "id": "a-overhaul",
      "icon": "♻️",
      "name": "Rebuilt Better",
      "desc": "Perform an Infrastructure Overhaul.",
      "condition": {
        "prestiges": 1
      },
      "reward": {
        "research": 3
      }
    },
    {
      "id": "a-double-overhaul",
      "icon": "🛠️",
      "name": "Again But Smarter",
      "desc": "Perform 3 Overhauls.",
      "condition": {
        "prestiges": 3
      },
      "reward": {
        "research": 8,
        "ip": 1
      }
    },
    {
      "id": "a-hyperscale",
      "icon": "🏭",
      "name": "Concrete Thunder",
      "desc": "Own a Hyperscale Campus.",
      "condition": {
        "ownedId": {
          "id": "hyperscale",
          "amount": 1
        }
      },
      "reward": {
        "research": 6
      }
    },
    {
      "id": "a-ai",
      "icon": "🤖",
      "name": "Warehouse of Thoughts",
      "desc": "Own an AI Compute Mega-Farm.",
      "condition": {
        "ownedId": {
          "id": "ai",
          "amount": 1
        }
      },
      "reward": {
        "research": 8
      }
    },
    {
      "id": "a-orbit",
      "icon": "🛰️",
      "name": "Edge Above The Clouds",
      "desc": "Own an Orbital Edge Array.",
      "condition": {
        "ownedId": {
          "id": "orbital",
          "amount": 1
        }
      },
      "reward": {
        "research": 10,
        "ip": 1
      }
    },
    {
      "id": "a-quantum",
      "icon": "⚛️",
      "name": "Reality Maintenance",
      "desc": "Own a Quantum Nexus Facility.",
      "condition": {
        "ownedId": {
          "id": "quantum",
          "amount": 1
        }
      },
      "reward": {
        "research": 15,
        "ip": 2
      }
    },
    {
      "id": "a-moon",
      "icon": "🌕",
      "name": "Moon Office",
      "desc": "Unlock Lunar Crater Vault.",
      "condition": {
        "unlockedRegion": "lunar"
      },
      "reward": {
        "credits": 50000000000000,
        "research": 10,
        "ip": 3
      }
    },
    {
      "id": "a-chaos",
      "icon": "⚠️",
      "name": "Calm Under Pressure",
      "desc": "Resolve 10 incidents.",
      "condition": {
        "incidentsResolved": 10
      },
      "reward": {
        "research": 12,
        "ip": 2
      }
    },
    {
      "id": "a-moon-project",
      "icon": "🧬",
      "name": "Vault Opened",
      "desc": "Complete the Lunar project.",
      "condition": {
        "builtProject": "lunar"
      },
      "reward": {
        "research": 20,
        "ip": 2
      }
    },
    {
      "id": "a-project-hoarder",
      "icon": "🏗️",
      "name": "Builder of Benefits",
      "desc": "Complete 4 regional projects.",
      "condition": {
        "builtProjects": 4
      },
      "reward": {
        "research": 8
      }
    },
    {
      "id": "a-project-maniac",
      "icon": "🪜",
      "name": "All Sites Upgraded",
      "desc": "Complete every regional project.",
      "condition": {
        "builtProjects": 8
      },
      "reward": {
        "research": 18,
        "ip": 2
      }
    },
    {
      "id": "a-research-25",
      "icon": "📚",
      "name": "Notebook Stack",
      "desc": "Accumulate 25 Research Data.",
      "condition": {
        "research": 25
      },
      "reward": {
        "credits": 12000000
      }
    },
    {
      "id": "a-research-100",
      "icon": "🔬",
      "name": "Mad Respectable Scientist",
      "desc": "Accumulate 100 Research Data.",
      "condition": {
        "research": 100
      },
      "reward": {
        "ip": 2
      }
    },
    {
      "id": "a-suite-upgrade",
      "icon": "🪑",
      "name": "More Wall Space",
      "desc": "Upgrade the office to Expanded Suite.",
      "condition": {
        "officeTier": 1
      },
      "reward": {
        "credits": 500000,
        "research": 2
      }
    },
    {
      "id": "a-command-floor",
      "icon": "🏢",
      "name": "Executive Bubble",
      "desc": "Upgrade to the Command Floor office.",
      "condition": {
        "officeTier": 3
      },
      "reward": {
        "research": 10,
        "ip": 1
      }
    },
    {
      "id": "a-fashion",
      "icon": "👔",
      "name": "Tiny Drip",
      "desc": "Own 5 cosmetic items.",
      "condition": {
        "cosmeticsOwned": 5
      },
      "reward": {
        "credits": 2500000
      }
    },
    {
      "id": "a-fashion-elite",
      "icon": "✨",
      "name": "Dressed For Uptime",
      "desc": "Own 12 cosmetic items.",
      "condition": {
        "cosmeticsOwned": 12
      },
      "reward": {
        "research": 6
      }
    },
    {
      "id": "a-frontier-stack",
      "icon": "🚀",
      "name": "Future Noise",
      "desc": "Own 10 Frontier units total.",
      "condition": {
        "ownedCategory": {
          "category": "Frontier",
          "amount": 10
        }
      },
      "reward": {
        "research": 8
      }
    },
    {
      "id": "a-million-cap",
      "icon": "🏗️",
      "name": "Floor Space Enjoyer",
      "desc": "Reach 3,000 total capacity.",
      "condition": {
        "totalCapacity": 3000
      },
      "reward": {
        "research": 10
      }
    },
    {
      "id": "a-billion-per-sec",
      "icon": "💹",
      "name": "Machine Weather",
      "desc": "Reach 1B potential Compute Credits per second.",
      "condition": {
        "potentialIncomePerSecond": 1000000000
      },
      "reward": {
        "ip": 2
      }
    },
    {
      "id": "a-trillion-per-sec",
      "icon": "🌩️",
      "name": "Thunderhead of Compute",
      "desc": "Reach 1T potential Compute Credits per second.",
      "condition": {
        "potentialIncomePerSecond": 1000000000000
      },
      "reward": {
        "ip": 4
      }
    },
    {
      "id": "a-silent-night",
      "icon": "🌙",
      "name": "A Quiet Shift",
      "desc": "Hold 3 incident shield minutes at once.",
      "condition": {
        "incidentShieldRemaining": 180
      },
      "reward": {
        "research": 5
      }
    },
    {
      "id": "a-manager-10",
      "icon": "📋",
      "name": "Meeting Spawned",
      "desc": "Hire 10 managers.",
      "condition": {
        "managers": 10
      },
      "reward": {
        "research": 10,
        "ip": 1
      }
    },
    {
      "id": "a-missions-25",
      "icon": "🧭",
      "name": "Field Season",
      "desc": "Complete 25 missions.",
      "condition": {
        "missionsCompleted": 25
      },
      "reward": {
        "research": 12,
        "ip": 1
      }
    },
    {
      "id": "a-missions-60",
      "icon": "🚚",
      "name": "Never Empty Board",
      "desc": "Complete 60 missions.",
      "condition": {
        "missionsCompleted": 60
      },
      "reward": {
        "research": 24,
        "ip": 3
      }
    },
    {
      "id": "a-incidents-20",
      "icon": "🚨",
      "name": "Alarm Connoisseur",
      "desc": "Resolve 20 incidents.",
      "condition": {
        "incidentsResolved": 20
      },
      "reward": {
        "research": 20,
        "ip": 2
      }
    },
    {
      "id": "a-prestige-8",
      "icon": "🌀",
      "name": "Serial Rebuilder",
      "desc": "Perform 8 Overhauls.",
      "condition": {
        "prestiges": 8
      },
      "reward": {
        "research": 18,
        "ip": 4
      }
    },
    {
      "id": "a-project-all",
      "icon": "🏗️",
      "name": "Every Site Sings",
      "desc": "Complete all regional projects and still want more.",
      "condition": {
        "builtProjects": 8
      },
      "reward": {
        "research": 28,
        "ip": 3
      }
    },
    {
      "id": "a-research-250",
      "icon": "🧠",
      "name": "Theory Garden",
      "desc": "Accumulate 250 Research Data.",
      "condition": {
        "research": 250
      },
      "reward": {
        "ip": 4
      }
    },
    {
      "id": "a-research-800",
      "icon": "🛰️",
      "name": "Paper Mountain",
      "desc": "Accumulate 800 Research Data.",
      "condition": {
        "research": 800
      },
      "reward": {
        "ip": 8
      }
    },
    {
      "id": "a-suite-max",
      "icon": "🏛️",
      "name": "Command Palace",
      "desc": "Upgrade the office to the Orbital Command Deck.",
      "condition": {
        "officeTier": 6
      },
      "reward": {
        "research": 40,
        "ip": 4
      }
    },
    {
      "id": "a-fashion-25",
      "icon": "🪩",
      "name": "Too Much Office",
      "desc": "Own 25 cosmetic items.",
      "condition": {
        "cosmeticsOwned": 25
      },
      "reward": {
        "research": 16,
        "ip": 1
      }
    },
    {
      "id": "a-capacity-10k",
      "icon": "🏗️",
      "name": "Concrete Ocean",
      "desc": "Reach 10,000 total capacity.",
      "condition": {
        "totalCapacity": 10000
      },
      "reward": {
        "research": 24,
        "ip": 2
      }
    },
    {
      "id": "a-qps-quad",
      "icon": "🌠",
      "name": "Planetary Hum",
      "desc": "Reach 1Qa potential Compute Credits per second.",
      "condition": {
        "potentialIncomePerSecond": 1000000000000000
      },
      "reward": {
        "ip": 6
      }
    },
    {
      "id": "a-qps-quin",
      "icon": "🪐",
      "name": "The Grid Owns A Moon",
      "desc": "Reach 1Qi potential Compute Credits per second.",
      "condition": {
        "potentialIncomePerSecond": 1000000000000000000
      },
      "reward": {
        "ip": 10
      }
    },
    {
      "id": "a-regions-8",
      "icon": "🌍",
      "name": "Global Footprint, Mild Back Pain",
      "desc": "Unlock all regions.",
      "condition": {
        "unlockedRegions": 8
      },
      "reward": {
        "research": 30,
        "ip": 4
      }
    }
  ],
  "cosmetics": {
    "office": [
      {
        "id": "default",
        "icon": "🧼",
        "name": "Default Office",
        "desc": "Base walls, base vibes, no extra decor.",
        "cost": 0
      },
      {
        "id": "neon-sign",
        "icon": "💗",
        "name": "Neon Sign",
        "desc": "A glowing sign for your tiny tyrant of uptime.",
        "cost": 9000
      },
      {
        "id": "plant-wall",
        "icon": "🪴",
        "name": "Plant Wall",
        "desc": "The room briefly pretends it is healthy.",
        "cost": 18000
      },
      {
        "id": "snack-shelf",
        "icon": "🍫",
        "name": "Snack Shelf",
        "desc": "Critical infrastructure for morale.",
        "cost": 26000
      },
      {
        "id": "holo-globe",
        "icon": "🌐",
        "name": "Holo Globe",
        "desc": "A tiny planet for your giant ambitions.",
        "cost": 650000
      },
      {
        "id": "lava-lamp",
        "icon": "🧡",
        "name": "Lava Lamp Corner",
        "desc": "Retro goo for modern uptime.",
        "cost": 140000
      },
      {
        "id": "wall-monitor",
        "icon": "📺",
        "name": "Wall NOC Display",
        "desc": "A giant status wall for dramatic pointing.",
        "cost": 780000
      },
      {
        "id": "framed-cert",
        "icon": "📜",
        "name": "Framed Certification Wall",
        "desc": "A suspicious number of accomplishments in tasteful frames.",
        "cost": 2400000
      },
      {
        "id": "server-poster",
        "icon": "🖼️",
        "name": "Retro Server Poster",
        "desc": "A giant poster of a machine nobody should miss this much.",
        "cost": 680000
      },
      {
        "id": "moon-window",
        "icon": "🌔",
        "name": "Moon Window Film",
        "desc": "Pretend every office has a lunar skyline.",
        "cost": 5200000
      }
    ],
    "desk": [
      {
        "id": "default",
        "icon": "🪑",
        "name": "Default Desk",
        "desc": "Functional. Slightly suspicious.",
        "cost": 0
      },
      {
        "id": "desk-mat",
        "icon": "🌈",
        "name": "RGB Desk Mat",
        "desc": "The desk now glows with purpose.",
        "cost": 12000
      },
      {
        "id": "tower-stack",
        "icon": "🖧",
        "name": "Tower Stack",
        "desc": "More hardware within arm’s reach.",
        "cost": 44000
      },
      {
        "id": "aquarium",
        "icon": "🐠",
        "name": "Desk Aquarium",
        "desc": "Tiny fish, enormous uptime.",
        "cost": 85000
      },
      {
        "id": "chair-upgrade",
        "icon": "💺",
        "name": "Ergonomic Throne",
        "desc": "A chair fit for someone who ignores sleep.",
        "cost": 220000
      },
      {
        "id": "keyboard-glow",
        "icon": "⌨️",
        "name": "Prismatic Keyboard",
        "desc": "Clacks upgraded to orchestral.",
        "cost": 420000
      },
      {
        "id": "mini-rack",
        "icon": "🗃️",
        "name": "Mini Demo Rack",
        "desc": "A tiny rack for huge feelings.",
        "cost": 1200000
      },
      {
        "id": "coffee-drone",
        "icon": "☕",
        "name": "Coffee Drone Dock",
        "desc": "A little machine for a very important beverage loop.",
        "cost": 3400000
      },
      {
        "id": "desk-bonsai",
        "icon": "🌳",
        "name": "Desk Bonsai",
        "desc": "Structured, trimmed, and slightly more peaceful.",
        "cost": 510000
      },
      {
        "id": "projector-pad",
        "icon": "🛰️",
        "name": "Holo Projector Pad",
        "desc": "A little table-side future for your tiny operator.",
        "cost": 4600000
      }
    ],
    "deskFinish": [
      {
        "id": "default",
        "icon": "🪵",
        "name": "Walnut Desk",
        "desc": "Warm walnut tones for the default desk shell.",
        "cost": 0
      },
      {
        "id": "graphite",
        "icon": "⬛",
        "name": "Graphite Desk",
        "desc": "A darker executive charcoal finish.",
        "cost": 180000
      },
      {
        "id": "ivory",
        "icon": "🤍",
        "name": "Ivory Desk",
        "desc": "A bright clean finish that bounces more light around the suite.",
        "cost": 220000
      },
      {
        "id": "synthwave",
        "icon": "🟪",
        "name": "Synthwave Desk",
        "desc": "Dark plum panels with neon undertones.",
        "cost": 420000
      },
      {
        "id": "emerald",
        "icon": "🟩",
        "name": "Emerald Desk",
        "desc": "A green-toned desk shell for the operator who wants more color in the room.",
        "cost": 510000
      }
    ],
    "chairFinish": [
      {
        "id": "default",
        "icon": "🪑",
        "name": "Navy Chair",
        "desc": "Default navy office chair upholstery.",
        "cost": 0
      },
      {
        "id": "charcoal",
        "icon": "⚫",
        "name": "Charcoal Chair",
        "desc": "A darker chair with a more understated feel.",
        "cost": 160000
      },
      {
        "id": "ice",
        "icon": "🩵",
        "name": "Ice Chair",
        "desc": "Cool pale upholstery with a softer futuristic tone.",
        "cost": 210000
      },
      {
        "id": "magenta",
        "icon": "💗",
        "name": "Magenta Chair",
        "desc": "Loud, energetic, and not at all subtle.",
        "cost": 390000
      },
      {
        "id": "lime",
        "icon": "💚",
        "name": "Lime Chair",
        "desc": "A vivid bright seat for chaotic uptime goblins.",
        "cost": 390000
      }
    ],
    "wallFinish": [
      {
        "id": "default",
        "icon": "🧱",
        "name": "Soft Green Walls",
        "desc": "A soft green wall finish with a calmer studio feel.",
        "cost": 0
      },
      {
        "id": "brushed-steel",
        "icon": "🩶",
        "name": "Brushed Steel",
        "desc": "Industrial steel paneling with a cooler brushed finish.",
        "cost": 48000
      },
      {
        "id": "rose-panel",
        "icon": "🌸",
        "name": "Rose Panel",
        "desc": "Soft warm wall panels with a retro blush cast.",
        "cost": 118000
      },
      {
        "id": "midnight-grid",
        "icon": "🌌",
        "name": "Midnight Grid",
        "desc": "Dark wall panels with a subtle neon control grid.",
        "cost": 420000
      },
      {
        "id": "emerald-acoustic",
        "icon": "🟩",
        "name": "Emerald Acoustic",
        "desc": "Deep green acoustic wall treatment with a studio vibe.",
        "cost": 980000
      },
      {
        "id": "circuit-board",
        "icon": "🟨",
        "name": "Circuit Board",
        "desc": "A glowing circuit-board wall finish with bright yellow traces over deep green panels.",
        "cost": 1350000
      }
      ,
      {
        "id": "signal-blue",
        "icon": "[]",
        "name": "Signal Blue Panels",
        "desc": "Calm blue control-room panels with subtle illuminated seams.",
        "cost": 690000
      },
      {
        "id": "archive-slate",
        "icon": "##",
        "name": "Archive Slate",
        "desc": "Layered slate panels for a quieter, more focused operations room.",
        "cost": 1850000
      }
    ],
    "floorFinish": [
      {
        "id": "default",
        "icon": "🧼",
        "name": "Dark Gray Floor",
        "desc": "A light gray matte floor with a clean office finish.",
        "cost": 0
      },
      {
        "id": "warm-oak",
        "icon": "🪵",
        "name": "Warm Oak",
        "desc": "A warmer plank floor for the human side of uptime.",
        "cost": 52000
      },
      {
        "id": "dark-rubber",
        "icon": "⬛",
        "name": "Dark Rubber",
        "desc": "Low-glare anti-fatigue flooring for long shifts.",
        "cost": 146000
      },
      {
        "id": "hex-epoxy",
        "icon": "🔷",
        "name": "Hex Epoxy",
        "desc": "Industrial epoxy floor with faint hex geometry.",
        "cost": 390000
      },
      {
        "id": "aurora-laminate",
        "icon": "🌈",
        "name": "Aurora Laminate",
        "desc": "A glossy laminate with subtle neon color drift.",
        "cost": 860000
      },
      {
        "id": "aesthetic-tile",
        "icon": "🩷",
        "name": "Kitchen Tile",
        "desc": "A repeated kitchen-style tile floor based on the uploaded model and texture.",
        "cost": 1200000
      },
      {
        "id": "sci-fi-tile",
        "icon": "🛸",
        "name": "Sci-Fi Tile",
        "desc": "A futuristic panel floor with glowing teal sci-fi accents.",
        "cost": 1600000
      }
      ,
      {
        "id": "amber-grid",
        "icon": "++",
        "name": "Amber Grid",
        "desc": "Low-glare graphite flooring with warm amber guidance lines.",
        "cost": 1050000
      }
    ],
    "outfit": [
      {
        "id": "default",
        "icon": "👕",
        "name": "Default Outfit",
        "desc": "The baseline operator look.",
        "cost": 0
      },
      {
        "id": "hoodie",
        "icon": "🟪",
        "name": "Ops Hoodie",
        "desc": "Soft fabric, hard uptime.",
        "cost": 15000
      },
      {
        "id": "blazer",
        "icon": "🧥",
        "name": "Executive Blazer",
        "desc": "A jacket that says “approve the rack order.”",
        "cost": 75000
      },
      {
        "id": "space",
        "icon": "👨‍🚀",
        "name": "Orbital Suit",
        "desc": "For vacuum-rated professionalism.",
        "cost": 4200000
      },
      {
        "id": "wizard",
        "icon": "🧙",
        "name": "Cable Wizard Robes",
        "desc": "Purely ceremonial. Highly effective-looking.",
        "cost": 12000000
      },
      {
        "id": "retro",
        "icon": "🕶️",
        "name": "Synthwave Ops",
        "desc": "Pastel neon for midnight maintenance.",
        "cost": 640000
      },
      {
        "id": "hazmat",
        "icon": "🦺",
        "name": "Incident Hazmat",
        "desc": "For when the blinking looks contagious.",
        "cost": 2600000
      }
    ],
    "wall": [
      {
        "id": "default",
        "icon": "🧱",
        "name": "Bare Walls",
        "desc": "The walls bravely contribute nothing.",
        "cost": 0
      },
      {
        "id": "uplink-map",
        "icon": "🗺️",
        "name": "Uplink Map",
        "desc": "A glowing topology map for dramatic pointing.",
        "cost": 340000
      },
      {
        "id": "award-shelf",
        "icon": "🏆",
        "name": "Award Shelf",
        "desc": "A row of tiny trophies and deeply earned smugness.",
        "cost": 880000
      },
      {
        "id": "maintenance-clock",
        "icon": "🕰️",
        "name": "Maintenance Clock",
        "desc": "Always technically almost maintenance window time.",
        "cost": 160000
      },
      {
        "id": "fiber-art",
        "icon": "🎨",
        "name": "Fiber Art Panel",
        "desc": "A tasteful wall piece made of cables and ambition.",
        "cost": 2600000
      },
      {
        "id": "incident-board",
        "icon": "📛",
        "name": "Incident Board",
        "desc": "A red-tinted board full of clipped tickets and solved disasters.",
        "cost": 7200000
      }
      ,
      {
        "id": "ops-beacon",
        "icon": "!",
        "name": "Ops Beacon",
        "desc": "A small pulse beacon that gives the office a live operations heartbeat.",
        "cost": 960000
      },
      {
        "id": "runbook-board",
        "icon": "=",
        "name": "Runbook Board",
        "desc": "A whiteboard full of deployment notes, checklists, and carefully contained optimism.",
        "cost": 1750000
      }
    ],
    "floor": [
      {
        "id": "default",
        "icon": "🧼",
        "name": "Plain Floor",
        "desc": "Functional flooring. Nobody writes songs about it.",
        "cost": 0
      },
      {
        "id": "led-strip",
        "icon": "💡",
        "name": "LED Floor Strip",
        "desc": "Under-lighting for dramatic uptime entrances.",
        "cost": 120000
      },
      {
        "id": "floor-runner",
        "icon": "🪄",
        "name": "Cable Runner Mat",
        "desc": "A purposeful pathway through your tiny empire.",
        "cost": 260000
      },
      {
        "id": "hex-rug",
        "icon": "🔷",
        "name": "Hex Rug",
        "desc": "A geometric rug that says “I manage dashboards.”",
        "cost": 640000
      },
      {
        "id": "floor-bot",
        "icon": "🤖",
        "name": "Roaming Floor Bot",
        "desc": "A harmless little floor bot that pretends to be essential.",
        "cost": 4400000
      },
      {
        "id": "light-grid",
        "icon": "🌈",
        "name": "Light Grid Tiles",
        "desc": "The floor itself now looks overclocked.",
        "cost": 12000000
      },
      {
        "id": "pendant-light",
        "icon": "💡",
        "name": "Pendant Light",
        "desc": "A warm imported lamp that actually lights the office around it.",
        "cost": 2800000
      }
      ,
      {
        "id": "server-island",
        "icon": "[]",
        "name": "Edge Rack Island",
        "desc": "A compact free-standing service rack with a quiet line of live hardware.",
        "cost": 6400000
      }
    ],
    "shelf": [
      {
        "id": "default",
        "icon": "📦",
        "name": "No Shelf Add-ons",
        "desc": "Storage is theoretical.",
        "cost": 0
      },
      {
        "id": "parts-bins",
        "icon": "🧰",
        "name": "Parts Bins",
        "desc": "Neatly stacked adapters, screws, and dangerous confidence.",
        "cost": 140000
      },
      {
        "id": "retro-console",
        "icon": "🎮",
        "name": "Retro Console Stack",
        "desc": "A small shrine to past plastic glory.",
        "cost": 980000
      },
      {
        "id": "bookcase",
        "icon": "📚",
        "name": "Ops Bookcase",
        "desc": "Manuals, diagrams, and probably a few snack wrappers.",
        "cost": 520000
      },
      {
        "id": "model-sat",
        "icon": "🛰️",
        "name": "Model Satellite",
        "desc": "A tiny orbital brag on a sturdy shelf.",
        "cost": 3600000
      },
      {
        "id": "cold-spares",
        "icon": "💽",
        "name": "Cold Spare Locker",
        "desc": "Drives, fans, and the smell of future preparedness.",
        "cost": 8800000
      }
      ,
      {
        "id": "uplink-radio",
        "icon": "~",
        "name": "Uplink Radio",
        "desc": "A compact relay receiver that keeps a little signal moving through the room.",
        "cost": 1850000
      }
    ]
  }
};


window.UptimeEmpireData.seasonDefs = [
  {
    id: "heatwave-quarter",
    name: "Heatwave Quarter",
    icon: "☀️",
    desc: "Cooling is under pressure, but the market is hungry.",
    effects: {
      multiply: { globalIncome: 1.12 },
      add: { incidentChanceReduction: -0.08 },
      categoryMultiply: { Facilities: 1.1 }
    },
    summary: "Income +12%, Facilities x1.10, incidents a little more frequent"
  },
  {
    id: "ai-gold-rush",
    name: "AI Gold Rush",
    icon: "🤖",
    desc: "Benchmark money rains from the sky and research labs do not sleep.",
    effects: {
      multiply: { researchBonus: 1.18, missionReward: 1.08 },
      categoryMultiply: { Frontier: 1.18, Cloud: 1.08 }
    },
    summary: "Research x1.18, mission rewards x1.08, Frontier x1.18"
  },
  {
    id: "cable-catastrophe",
    name: "Cable Catastrophe Season",
    icon: "🧵",
    desc: "Demand softens a little, but mission crews become wildly efficient.",
    effects: {
      multiply: { missionSpeed: 1.18 },
      add: { missionCooldownReduction: 0.12 },
      categoryMultiply: { Networking: 1.14 }
    },
    summary: "Mission speed x1.18, mission cooldown -12%, Networking x1.14"
  },
  {
    id: "resilience-drive",
    name: "Resilience Drive",
    icon: "🛡️",
    desc: "The empire tightens bolts, hardens systems, and quietly prints steadier money.",
    effects: {
      add: { incidentChanceReduction: 0.12, responsePower: 0.1 },
      multiply: { automatedIncome: 1.08 }
    },
    summary: "Incident chance -12%, response +10%, automated income x1.08"
  }
];

window.UptimeEmpireData.doctrineDefs = [
  {
    id: "balanced",
    name: "Balanced Doctrine",
    icon: "⚖️",
    desc: "No sharp edges. A dependable all-round posture.",
    effects: {},
    unlockWhen: {}
  },
  {
    id: "automation-first",
    name: "Automation First",
    icon: "⚙️",
    desc: "Managers and idle flow take center stage.",
    effects: { multiply: { automatedIncome: 1.22 }, add: { managerDiscount: 0.08 }, categoryMultiply: { Cloud: 1.06 } },
    unlockWhen: { managers: 4 }
  },
  {
    id: "research-consortium",
    name: "Research Consortium",
    icon: "🧪",
    desc: "Leaner profits, stranger discoveries, faster long-tail progress.",
    effects: { multiply: { researchBonus: 1.3 }, add: { missionCooldownReduction: 0.08 }, categoryMultiply: { Frontier: 1.08 } },
    unlockWhen: { research: 16 }
  },
  {
    id: "fortress-uptime",
    name: "Fortress Uptime",
    icon: "🧱",
    desc: "Build a nearly boring machine and punish incidents for existing.",
    effects: { add: { incidentChanceReduction: 0.12, responsePower: 0.14 }, multiply: { globalIncome: 1.06 } },
    unlockWhen: { incidentsResolved: 6 }
  },
  {
    id: "contract-hunters",
    name: "Contract Hunters",
    icon: "📜",
    desc: "Missions become a core pillar of the run.",
    effects: { multiply: { missionReward: 1.22, missionSpeed: 1.08 }, add: { missionSlots: 1 } },
    unlockWhen: { missionsCompleted: 8 }
  }
];

window.UptimeEmpireData.eraDefs = [
  {
    id: "foundation",
    name: "Foundation Era",
    icon: "🏗️",
    desc: "The classic climb from garage chaos to serious compute.",
    effects: {},
    unlockWhen: {}
  },
  {
    id: "cloud-age",
    name: "Cloud Age",
    icon: "☁️",
    desc: "An era of scale, orchestration, and smooth automation.",
    effects: { multiply: { globalIncome: 1.08, automatedIncome: 1.1 }, categoryMultiply: { Cloud: 1.14 } },
    unlockWhen: { prestiges: 2, highestTier: 8 }
  },
  {
    id: "orbital-age",
    name: "Orbital Compute Age",
    icon: "🛰️",
    desc: "The empire starts thinking in orbits and long shadows.",
    effects: { multiply: { missionReward: 1.12 }, add: { capacityBonus: 0.08 }, categoryMultiply: { Frontier: 1.16 } },
    unlockWhen: { prestiges: 4, highestTier: 11 }
  },
  {
    id: "post-quantum",
    name: "Post-Quantum Era",
    icon: "⚛️",
    desc: "Ridiculous future throughput for players who refuse to stop escalating.",
    effects: { multiply: { globalIncome: 1.15, researchBonus: 1.15 }, add: { officeSlotsBonus: 2 }, categoryMultiply: { Frontier: 1.25, Networking: 1.08 } },
    unlockWhen: { prestiges: 7, highestTier: 14 }
  }
];

window.UptimeEmpireData.challengeDefs = [
  {
    id: "lean-crew",
    name: "Lean Crew",
    icon: "🪫",
    desc: "Start the next run with fewer hands and make it work anyway.",
    effects: { add: { missionSlots: -1, managerDiscount: -0.05 }, multiply: { globalIncome: 0.88 } },
    goal: { managers: 5, highestTier: 8 },
    reward: { ip: 2, research: 8 },
    rewardText: "+2 IP, +8 RD",
    unlockWhen: { prestiges: 1 }
  },
  {
    id: "fragile-grid",
    name: "Fragile Grid",
    icon: "⚠️",
    desc: "Capacity shrinks and incidents bite harder, but the reward is worth the drama.",
    effects: { add: { capacityBonus: -0.2, incidentChanceReduction: -0.08 }, multiply: { missionReward: 1.1 } },
    goal: { unlockedRegion: "apac", incidentsResolved: 8 },
    reward: { ip: 3, fragments: 2 },
    rewardText: "+3 IP, +2 fragments",
    unlockWhen: { prestiges: 2 }
  },
  {
    id: "research-drought",
    name: "Research Drought",
    icon: "📉",
    desc: "Research is stingier, so every breakthrough matters.",
    effects: { multiply: { researchBonus: 0.72, globalIncome: 1.06 } },
    goal: { research: 120, highestTier: 11 },
    reward: { ip: 4, research: 24 },
    rewardText: "+4 IP, +24 RD",
    unlockWhen: { prestiges: 3 }
  },
  {
    id: "moonshot",
    name: "Moonshot Protocol",
    icon: "🌕",
    desc: "Push a run all the way into lunar absurdity under tighter economics.",
    effects: { multiply: { globalIncome: 0.82 }, add: { regionCostReduction: -0.08 }, categoryMultiply: { Frontier: 1.05 } },
    goal: { unlockedRegion: "lunar", highestTier: 13 },
    reward: { ip: 6, fragments: 3 },
    rewardText: "+6 IP, +3 fragments",
    unlockWhen: { prestiges: 5 }
  }
];

window.UptimeEmpireData.contractDefs = {
  daily: [
    { id: "daily-managers", icon: "🧑‍💼", name: "Staff the Floor", desc: "Have at least 3 managers on duty.", goal: { managers: 3 }, reward: { credits: 12000, research: 2 } },
    { id: "daily-missions", icon: "🎫", name: "Clear the Queue", desc: "Complete 3 missions this empire cycle.", goal: { missionsCompleted: 3 }, reward: { credits: 18000, research: 3 } },
    { id: "daily-incident", icon: "🧯", name: "Quiet the Alarm", desc: "Resolve 2 incidents.", goal: { incidentsResolved: 2 }, reward: { credits: 16000, research: 2, fragments: 1 } },
    { id: "daily-throughput", icon: "📈", name: "Raise Throughput", desc: "Reach 40K average potential per second.", goal: { potentialIncomePerSecond: 40000 }, reward: { credits: 24000, research: 4 } },
    { id: "daily-rackup", icon: "🗄️", name: "Rack It Higher", desc: "Own 25 Small Server Racks.", goal: { ownedId: { id: "rack", amount: 25 } }, reward: { credits: 22000, research: 3 } },
    { id: "daily-office", icon: "🏢", name: "Neaten the Suite", desc: "Upgrade the office to Expanded Suite.", goal: { officeTier: 1 }, reward: { credits: 28000, research: 4 } }
  ],
  weekly: [
    { id: "weekly-project", icon: "🏗️", name: "Build Something Permanent", desc: "Complete 2 regional projects.", goal: { builtProjects: 2 }, reward: { credits: 200000, research: 10, fragments: 2 } },
    { id: "weekly-prestige", icon: "♻️", name: "Turn the Wheel", desc: "Perform 2 overhauls.", goal: { prestiges: 2 }, reward: { credits: 350000, research: 14, ip: 2 } },
    { id: "weekly-scale", icon: "🌐", name: "Open the Map", desc: "Unlock 4 regions.", goal: { unlockedRegions: 4 }, reward: { credits: 280000, research: 12, fragments: 2 } },
    { id: "weekly-frontier", icon: "🚀", name: "Step Into the Weird", desc: "Own 1 Orbital Edge Array.", goal: { ownedId: { id: "orbital", amount: 1 } }, reward: { credits: 450000, research: 18, ip: 2 } },
    { id: "weekly-operator", icon: "🧠", name: "Mission Control", desc: "Complete 12 missions.", goal: { missionsCompleted: 12 }, reward: { credits: 260000, research: 12, fragments: 2 } }
  ]
};

window.UptimeEmpireData.upgradeDefs.push(
  {
    id: "research-branch-fabric",
    view: "research",
    branch: "Theory",
    icon: "🕸️",
    name: "Fabric Intelligence",
    desc: "Mission teams +1 and mission cooldowns relax a little.",
    cost: 1800000,
    costResearch: 18,
    effects: { add: { missionSlots: 1, missionCooldownReduction: 0.08 } },
    visibleWhen: { research: 12 }
  },
  {
    id: "research-branch-ward",
    view: "research",
    branch: "Security",
    icon: "🛡️",
    name: "Autonomous Ward Grid",
    desc: "Incidents get rarer and shorter. The NOC exhales slightly.",
    cost: 4200000,
    costResearch: 26,
    effects: { add: { incidentChanceReduction: 0.08, incidentDurationReduction: 0.12 } },
    visibleWhen: { incidentsResolved: 5, research: 20 }
  },
  {
    id: "research-branch-archive",
    view: "research",
    branch: "Ops",
    icon: "📚",
    name: "Archive Predictive Models",
    desc: "Offline cap +2h and offline efficiency +10%.",
    cost: 2600000,
    costResearch: 20,
    effects: { add: { offlineCapHours: 2, offlineEfficiency: 0.1 } },
    visibleWhen: { managers: 4, research: 12 }
  },
  {
    id: "research-branch-materials",
    view: "research",
    branch: "Materials",
    icon: "🧱",
    name: "Adaptive Cold Aisles",
    desc: "Capacity +10% and high-tier pressure softens.",
    cost: 8500000,
    costResearch: 34,
    effects: { add: { capacityBonus: 0.1, highTierCapacityReduction: 0.08 } },
    visibleWhen: { unlockedRegion: "north", research: 24 }
  },
  {
    id: "research-branch-skyhook",
    view: "research",
    branch: "Frontier",
    icon: "🛰️",
    name: "Skyhook Logistics",
    desc: "Frontier income rises and the office gains 2 extra decor slots.",
    cost: 28000000,
    costResearch: 56,
    effects: { categoryMultiply: { Frontier: 1.18 }, add: { officeSlotsBonus: 2 } },
    visibleWhen: { highestTier: 11, research: 40 }
  }
);


window.UptimeEmpireData.campaignGoalDefs = [
  {
    id: "debt-free",
    icon: "🧾",
    stage: "Stage 1",
    name: "Pay Off the Data-Center Debt",
    desc: "Buy out the ugly launch debt and stop feeding your best gains to creditors.",
    costCredits: 750000000,
    costResearch: 18,
    rewardText: "Global income x1.05 • mission rewards x1.05 • starting credits +25K",
    effects: { multiply: { globalIncome: 1.05, missionReward: 1.05 }, add: { startingCredits: 25000 } }
  },
  {
    id: "buy-campus",
    icon: "🏢",
    stage: "Stage 2",
    name: "Buy the Campus",
    desc: "Stop renting someone else's dream and turn the empire into a property-owning institution.",
    requiresGoal: "debt-free",
    unlockWhen: { officeTier: 4, unlockedRegions: 4 },
    costCredits: 6000000000000,
    costResearch: 180,
    rewardText: "Auto income x1.12 • capacity +15% • office slots +2",
    effects: { multiply: { automatedIncome: 1.12 }, add: { capacityBonus: 0.15, officeSlotsBonus: 2 } }
  },
  {
    id: "fund-orbital",
    icon: "🛰️",
    stage: "Stage 3",
    name: "Build the Global Network",
    desc: "Open serious regional sites and make Uptime a company people count on everywhere.",
    requiresGoal: "buy-campus",
    unlockWhen: { officeTier: 5, unlockedRegions: 5, research: 320 },
    costCredits: 9000000000000000,
    costResearch: 900,
    costIp: 12,
    costFragments: 6,
    rewardText: "Research x1.15 • mission speed x1.08 • mission rewards x1.12",
    effects: { multiply: { researchBonus: 1.15, missionSpeed: 1.08, missionReward: 1.12 } }
  },
  {
    id: "sovereign-backbone",
    icon: "👑",
    stage: "Stage 4",
    name: "Build Uptime Empire",
    desc: "Turn the shed project into the empire you promised yourself you would build. Then decide how far it can go.",
    requiresGoal: "fund-orbital",
    unlockWhen: { unlockedRegions: 6, prestiges: 3, highestTier: 13 },
    costCredits: 25000000000000000000,
    costResearch: 1800,
    costIp: 30,
    costFragments: 18,
    rewardText: "Global income x1.18 • auto income x1.18 • cycle speed x1.08 • all categories x1.05",
    effects: { multiply: { globalIncome: 1.18, automatedIncome: 1.18, speed: 1.08 }, categoryMultiply: { Servers: 1.05, Networking: 1.05, Cloud: 1.05, Facilities: 1.05, Frontier: 1.05 } }
  }
];

window.UptimeEmpireData.uiSkinDefs = [
  {
    id: 'founder',
    name: "Founder's Terminal",
    desc: 'The original cyan-and-green shed terminal. Quiet, crisp, and always available.',
    unlockText: 'Included',
    animated: false
  },
  {
    id: 'noc',
    name: 'NOC Glass',
    desc: 'A polished operations display with a restrained animated status scanner.',
    unlockWhen: { campaignGoal: 'buy-campus' },
    unlockText: 'Buy the campus',
    animated: true
  },
  {
    id: 'codefall',
    name: 'Codefall',
    desc: 'A dark terminal backed by a subtle, low-contrast digital code rain.',
    costCredits: 50000000,
    unlockText: '50M CC',
    animated: true
  },
  {
    id: 'crt',
    name: 'Amber CRT',
    desc: 'Warm amber phosphor, soft scanlines, and the glow of a machine that never sleeps.',
    unlockWhen: { prestiges: 1 },
    unlockText: 'Complete one Overhaul',
    animated: true
  }
];

window.UptimeEmpireData.contractContactDefs = {
  'daily-managers': { client: 'Mara Venn', org: 'People Operations' },
  'daily-missions': { client: 'Moss Chen', org: 'Service Desk' },
  'daily-incident': { client: 'Eli Reyes', org: 'Reliability Watch' },
  'daily-throughput': { client: 'Nadia Holt', org: 'Capacity Desk' },
  'daily-rackup': { client: 'Benji Rook', org: 'Rack Logistics' },
  'daily-office': { client: 'Sana Pike', org: 'Workplace Systems' },
  'weekly-project': { client: 'Hana Ito', org: 'Site Direction' },
  'weekly-prestige': { client: 'Alex Rowan', org: 'Founder Operations' },
  'weekly-scale': { client: 'Imani Cole', org: 'Regional SRE' },
  'weekly-frontier': { client: 'Sol Varga', org: 'Orbital Operations' },
  'weekly-operator': { client: 'Priya Shah', org: 'Network Command' }
};

window.UptimeEmpireData.managerArrivalLines = {
  home: 'I labeled the power strip. This counts as governance now.',
  refurb: 'The refurbished nodes are old, not fragile. Mostly.',
  rack: 'Racks are upright, airflow is negotiable, morale is excellent.',
  switch: 'I found the bottleneck. It was a meeting pretending to be a router.',
  cluster: 'Virtualization is live. Please do not name every VM after snacks.',
  pod: 'The platform is stable enough to become someone else\'s problem.',
  hall: 'The hall is humming. That is either good news or a very expensive clue.',
  colo: 'Clients are asking whether we have a logo. We have uptime instead.',
  regional: 'Regional traffic is up. The weather maps are now operational documents.',
  global: 'Global change window approved. Nobody say the word "quick".',
  hyperscale: 'Campus fleet checked in. Forklifts now have stronger opinions than I do.',
  ai: 'The compute farm is thinking loudly. I have asked it to use indoor voices.',
  orbital: 'Orbital relay locked. The moon has surprisingly strict change control.',
  quantum: 'The facility says the fix both happened and did not happen. I filed two tickets.'
};
