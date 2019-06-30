const chainParams = {
	SUPERNET: {
		ac_supply: 816061,
	},
	REVS: {
		ac_supply: 1300000,
	},
	WLC: {
		ac_supply: 210000000,
	},
	PANGEA: {
		ac_supply: 999999,
	},
	PGT: {
		ac_supply: 10000000,
		ac_end: 1,
	},
	DEX: {
		ac_supply: 999999,
	},
	JUMBLR: {
		ac_supply: 999999,
	},
	BET: {
		ac_supply: 999999,
	},
	CRYPTO: {
		ac_supply: 999999,
	},
	HODL: {
		ac_supply: 9999999,
	},
	ILN: {
		ac_supply: 10000000000,
		ac_cc: 2,
		addnode: '51.75.122.83',
	},
        K64: {
                ac_supply: 64000777,
                ac_reward: 0,
                ac_staked: 10,
                addnode: '18.197.20.211',
        },
	MSHARK: {
		ac_supply: 1400000,
	},
	BOTS: {
		ac_supply: 999999,
	},
	MGW: {
		ac_supply: 999999,
	},
	MVP: {
		ac_supply: 1000000,
	},
	KV: {
		ac_supply: 1000000,
	},
	CEAL: {
		ac_supply: 366666666,
	},
	MESH: {
		ac_supply: 1000007,
	},
	COQUI: {
		ac_supply: 72000000,
		ac_ccactivate: 200000,
 	},
	KMDICE: {
		ac_supply: 10500000,
		ac_reward: 2500000000,
		ac_halving: 210000,
		ac_cc: 2,
		addressindex: 1,
		spentindex: 1,
		genproclimit: true
	},
	CHAIN: {
		ac_supply: 999999,
		addnode: '78.47.146.222',
	},
	GLXT: {
		ac_supply: 10000000000,
		addnode: '13.230.224.15',
	},
	EQL: {
		ac_supply: 500000000,
		addnode: '46.101.124.153',
	  ac_ccactivate: 205000,
	},
	AXO: {
		ac_supply: 200000000,
	},
	ETOMIC: {
		ac_supply: 100000000,
	},
	BTCH: {
		ac_supply: 20998641,
	},
	BEER: {
		ac_supply: 100000000,
		addnode: '24.54.206.138',
	},
	PIZZA: {
		ac_supply: 100000000,
		addnode: '24.54.206.138',
	},
	OOT: {
		ac_supply: 216000000,
		ac_sapling: 5000000,
		addnode: '174.138.107.226',
	},
	NINJA: {
		ac_supply: 100000000,
		addnode: '192.241.134.19',
	},
	BNTN: {
		ac_supply: 500000000,
		addnode: '94.130.169.205',
	},
	PRLPAY: {
		ac_supply: 500000000,
		addnode: '13.250.226.125',
	},
	ZILLA: {
		ac_supply: 11000000,
		ac_sapling: 5000000,
		addnode: '51.68.215.104',
	},
	DSEC: {
		ac_supply: 7000000,
		addnode: '185.148.147.30',
	},
	MGNX: {
		ac_supply: 12465003,
		ac_staked: 90,
		ac_reward: 2000000000,
		ac_halving: 525960,
		ac_cc: 2,
		ac_end: 2629800,
		addnode: '142.93.27.180',
		genproclimit: true,
	},
	CCL: {
		ac_supply: 200000000,
		ac_end: 1,
		ac_cc: 2,
		addressindex: 1, // is this necessary(?)
		spentindex: 1,
		addnode: [
			'142.93.136.89',
			'195.201.22.89',
		],
	},
	PIRATE: {
		ac_supply: 0,
		ac_reward: 25600000000,
		ac_halving: 77777,
		ac_private: 1,
		addnode: [
			'136.243.102.225',
			'78.47.205.239',
		],
		genproclimit: true,
	},
	KOIN: {
		ac_supply: 125000000,
		addnode: '3.0.32.10',
	},
	DION: {
		ac_supply: 3900000000,
		ac_reward: 22260000000,
		ac_staked: 100,
		ac_cc: 1,
		ac_end: 4300000000,
		addnode: '51.75.124.34',
		genproclimit: true,
	},
	PTX: {
		ac_supply: 12000000,
		ac_reward: 1500000000,
		ac_staked: 50,
		ac_end: 12000000,
		addnode: '142.11.199.63',
		genproclimit: true,
	},
	ZEX: {
		ac_reward: 13000000000,
		ac_halving: 525600,
		ac_pubkey: '039d4a50cc70d1184e462a22edb3b66385da97cc8059196f8305c184a3e21440af',
		ac_cc: 2,
		ac_founders: 1,
		addnode: '5.9.102.210',
	},
	SPLTEST: {
		ac_supply: 5555555,
		ac_reward: 10000000000000,
		ac_cc: 2,
		addressindex: 1,
		spentindex: 1,
		addnode: [
			'54.36.126.42',
			'94.130.224.11',
		],
	},
	LUMBER: {
		ac_algo: 'verushash',
		ac_veruspos: 80,
		ac_cc: 2,
		ac_supply: 1260000,
		ac_reward: 470000000,
		ac_halving: 2100000,
		addnode: '149.202.84.141',
		genproclimit: true,
	},
	KSB: {
		ac_supply: 1000000000,
		ac_end: 1,
		ac_public: 1,
		addnode: [
			'37.187.225.231',
			'217.182.129.38',
		],
	},
	OUR: {
		ac_reward: 1478310502,
		ac_halving: 525600,
		ac_cc: 42,
		ac_supply: 100000000,
		ac_perc: 77700,
		ac_staked: 93,
		ac_pubkey: '02652a3f3e00b3a1875a918314f0bac838d6dd189a346fa623f5efe9541ac0b98c',
		ac_public: 1,
		addnode: [
			'37.187.225.231',
			'217.182.129.38',
		],
	},
	RICK: {
		ac_supply: 90000000000,
		ac_reward: 100000000,
		ac_cc: 3,
		addnode: '138.201.136.145',
	},
	MORTY: {
		ac_supply: 90000000000,
		ac_reward: 100000000,
		ac_cc: 3,
		addnode: '138.201.136.145',
	},
	VOTE2019: {
		ac_supply: 123651638,
		ac_public: 1,
		addnode: '95.213.238.98',
	},
	MTST3: {
		ac_supply: 100000,
		ac_cc: 27410,
		ac_reward: 300000000,
		addnode: '136.243.58.134',
		genproclimit: true,
	},
	RFOX: {
		ac_supply: 1000000000,
		ac_reward: 100000000,
		addnode: '78.47.196.146',
	},
	ZEXO: {
		ac_reward: 1478310502,
		ac_halving: 525600,
		ac_cc: 42,
		ac_ccenable: 236,
		ac_supply: 100000000,
		ac_perc: 77700,
		ac_staked: 93,
		ac_pubkey: '02713bd85e054db923694b6b7a85306264edf4d6bd6d331814f2b40af444b3ebbc',
		ac_public: 1,
		addnode: [
			'80.240.17.222',
			'195.201.20.230',
		],
	},
	LABS: {
		ac_supply: 350689,
		ac_reward: '0,0,800000000',
		ac_decay: '0,100000000,100000000',
		ac_halving: '129,1',
		ac_end: '128,10080,0',
		ac_notarypay: '64,100000000,1000000000',
		ac_eras: 3,
		ac_staked: 51,
		ac_sapling: 1,
		ac_cc: 101,
		ac_ccenable: '226,236',
		ac_cclib: 'labs',
		addnode: [
			'80.240.17.222',
			'195.201.20.230',
		],
	},
	DP: {
		ac_supply: 55500000,
		ac_public: 1,
		ac_staked: 50,
		ac_reward: 646400000,
		ac_blocktime: 120,
		ac_cc: 1,
		ac_ccenable: 229,
		addnode: [
			'seed-nodes.komodo.top',
		],
	},
};

module.exports = chainParams;
