/**
 * The directory. This file is the single source of truth.
 *
 * Rules for contributors (enforced by `npm run validate:data` in CI):
 * - Every code needs at least one https source.
 * - `official`     = the regulator or operator publishes it.
 * - `corroborated` = at least two independent sources agree.
 * - If sources contradict each other, leave the code out. A wrong USSD code that moves
 *   money is worse than a missing one. See the "What we left out" section on /about.
 * - `checkedAt` means "cross-checked against the listed sources on that date", not "dialed".
 */
import type { Provider } from './schema.js'

const CHECKED = '2026-10-23'

const S = {
  momocalc: {
    label: 'MoMoCalc bank code directory',
    url: 'https://momocalc.com/codes/ussd/nigeria',
  },
  rateweb: {
    label: 'Rateweb bank USSD cheat sheet',
    url: 'https://ng.rateweb.africa/bank-ussd-codes-nigeria/',
  },
  turnet: {
    label: 'Turnet Finance USSD guide',
    url: 'https://turnetfinance.ng/nigerian-bank-ussd-codes/',
  },
  pentalk: {
    label: 'PenTalk bank USSD list',
    url: 'https://pentalk.com.ng/nigerian-banks-ussd-codes/',
  },
  kuda: {
    label: 'Kuda: USSD codes for Nigerian banks',
    url: 'https://www.kuda.com/blog/ussd-codes-for-nigerian-banks-and-how-to-use-them/',
  },
  mansa: {
    label: 'Mansa API bank code reference',
    url: 'https://mansaapi.com/blog/nigerian-bank-codes-developers-guide',
  },
  vtyield: {
    label: 'Vtyield USSD cheat sheet',
    url: 'https://vtyield.com/blog/ussd-codes-nigeria-complete-cheat-sheet-2026-all-banks-networks',
  },
  nccCodes: {
    label: 'NCC: 13 harmonised short codes',
    url: 'https://consumer.ncc.gov.ng/articles/77-harmonized-short-codes-for-all-service-providers-13-new-universal-short-codes',
  },
  nccNin: {
    label: 'NCC: NIN and SIM integration FAQ',
    url: 'https://www.ncc.gov.ng/media-center/public-notices/frequently-asked-questions-nin-and-sim-integration',
  },
  nibss: {
    label: 'NIBSS: USSD validation service (*565)',
    url: 'https://nibss-plc.com.ng/ussd-validation-services/',
  },
  gosub: { label: 'Gosub network USSD guide', url: 'https://blog.gosub.ng/nigeria-ussd-code' },
  naijatips: {
    label: 'Naijatipsland network codes',
    url: 'https://naijatipsland.com/ussd-codes-nigeria/',
  },
} as const

type Entry = Provider['codes'][number]

const menu = (code: string, sources: Entry['sources']): Entry => ({
  action: 'menu',
  label: 'Main menu',
  code,
  verification: 'corroborated',
  checkedAt: CHECKED,
  sources,
})

const shortcut = (
  action: Entry['action'],
  label: string,
  code: string,
  sources: Entry['sources'],
): Entry => ({ action, label, code, verification: 'corroborated', checkedAt: CHECKED, sources })

const MENU_SOURCES = [S.momocalc, S.rateweb, S.pentalk]
const SHORTCUT_SOURCES = [S.kuda, S.turnet]

export const providers: Provider[] = [
  {
    id: 'gtbank',
    name: 'GTBank',
    category: 'bank',
    aliases: ['gtb', 'gtco', 'guaranty trust', 'guaranty trust bank', 'guaranty trust bank plc'],
    codes: [
      menu('*737#', MENU_SOURCES),
      shortcut('airtime', 'Buy airtime for your own number', '*737*{amount}#', SHORTCUT_SOURCES),
      shortcut('data', 'Buy mobile data', '*737*4#', SHORTCUT_SOURCES),
    ],
  },
  {
    id: 'access-bank',
    name: 'Access Bank',
    category: 'bank',
    aliases: ['access', 'access bank plc', 'diamond bank', 'access diamond'],
    codes: [
      menu('*901#', MENU_SOURCES),
      shortcut('airtime', 'Buy airtime for your own number', '*901*{amount}#', SHORTCUT_SOURCES),
      shortcut(
        'airtime',
        'Buy airtime for another number',
        '*901*{amount}*{phone}#',
        SHORTCUT_SOURCES,
      ),
    ],
  },
  {
    id: 'zenith-bank',
    name: 'Zenith Bank',
    category: 'bank',
    aliases: ['zenith', 'zenith bank plc', 'zib'],
    codes: [
      menu('*966#', MENU_SOURCES),
      shortcut('balance', 'Check your account balance', '*966*00#', [S.kuda, S.turnet, S.vtyield]),
      shortcut('airtime', 'Buy airtime for your own number', '*966*{amount}#', [
        S.kuda,
        S.turnet,
        S.rateweb,
      ]),
      shortcut(
        'airtime',
        'Buy airtime for another number',
        '*966*{amount}*{phone}#',
        SHORTCUT_SOURCES,
      ),
    ],
  },
  {
    id: 'uba',
    name: 'UBA',
    category: 'bank',
    aliases: ['united bank for africa', 'united bank africa', 'uba leo'],
    codes: [
      menu('*919#', MENU_SOURCES),
      shortcut('balance', 'Check your account balance', '*919*00#', [S.kuda, S.turnet, S.vtyield]),
    ],
  },
  {
    id: 'first-bank',
    name: 'First Bank',
    category: 'bank',
    aliases: ['firstbank', 'fbn', 'first bank of nigeria', 'firstmobile', 'fbnquest'],
    codes: [
      menu('*894#', MENU_SOURCES),
      shortcut('balance', 'Check your account balance', '*894*00#', [S.kuda, S.turnet, S.vtyield]),
      shortcut('airtime', 'Buy airtime for your own number', '*894*{amount}#', SHORTCUT_SOURCES),
    ],
  },
  {
    id: 'fidelity-bank',
    name: 'Fidelity Bank',
    category: 'bank',
    aliases: ['fidelity', 'fidelity bank plc'],
    codes: [menu('*770#', MENU_SOURCES)],
  },
  {
    id: 'fcmb',
    name: 'FCMB',
    category: 'bank',
    aliases: ['first city monument bank', 'first city monument', 'fcmb bank'],
    codes: [menu('*329#', MENU_SOURCES)],
  },
  {
    id: 'ecobank',
    name: 'Ecobank',
    category: 'bank',
    aliases: ['ecobank nigeria', 'eco bank'],
    codes: [menu('*326#', MENU_SOURCES)],
  },
  {
    id: 'sterling-bank',
    name: 'Sterling Bank',
    category: 'bank',
    aliases: ['sterling', 'sterling bank plc', 'sterling one'],
    codes: [menu('*822#', MENU_SOURCES)],
  },
  {
    id: 'stanbic-ibtc',
    name: 'Stanbic IBTC',
    category: 'bank',
    aliases: ['stanbic', 'ibtc', 'stanbic ibtc bank'],
    codes: [menu('*909#', MENU_SOURCES)],
  },
  {
    id: 'union-bank',
    name: 'Union Bank',
    category: 'bank',
    aliases: ['union', 'union bank of nigeria', 'ubn'],
    codes: [menu('*826#', MENU_SOURCES)],
  },
  {
    id: 'keystone-bank',
    name: 'Keystone Bank',
    category: 'bank',
    aliases: ['keystone', 'keystone bank limited'],
    codes: [menu('*7111#', MENU_SOURCES)],
  },
  {
    id: 'polaris-bank',
    name: 'Polaris Bank',
    category: 'bank',
    aliases: ['polaris', 'skye bank', 'polaris bank limited'],
    codes: [menu('*833#', MENU_SOURCES)],
  },
  {
    id: 'wema-bank',
    name: 'Wema Bank',
    category: 'bank',
    aliases: ['wema', 'alat', 'alat by wema', 'wema bank plc'],
    codes: [menu('*945#', MENU_SOURCES)],
  },
  {
    id: 'unity-bank',
    name: 'Unity Bank',
    category: 'bank',
    aliases: ['unity', 'unity bank plc'],
    codes: [menu('*7799#', MENU_SOURCES)],
  },
  {
    id: 'jaiz-bank',
    name: 'Jaiz Bank',
    category: 'bank',
    aliases: ['jaiz', 'jaiz bank plc'],
    codes: [menu('*389*301#', [S.pentalk, S.mansa, S.vtyield])],
  },
  {
    id: 'opay',
    name: 'OPay',
    category: 'fintech',
    aliases: ['o pay', 'opay digital services', 'paycom'],
    codes: [menu('*955#', [S.momocalc, S.rateweb, S.turnet, S.pentalk, S.mansa])],
  },
  {
    id: 'palmpay',
    name: 'PalmPay',
    category: 'fintech',
    aliases: ['palm pay'],
    codes: [menu('*861#', [S.momocalc, S.rateweb, S.turnet, S.pentalk])],
  },
  {
    id: 'moniepoint',
    name: 'Moniepoint',
    category: 'fintech',
    aliases: ['monie point', 'moniepoint mfb', 'teamapt'],
    note: 'Moniepoint USSD is reported as *5573# by four independent sources. One older guide lists a different code, so confirm in the Moniepoint app if it fails.',
    codes: [menu('*5573#', [S.momocalc, S.rateweb, S.pentalk, S.mansa])],
  },
  {
    id: 'mobile-networks',
    name: 'All mobile networks',
    category: 'network',
    aliases: [
      'mtn',
      'airtel',
      'glo',
      'globacom',
      '9mobile',
      'etisalat',
      't2',
      't2 mobile',
      'network',
      'telco',
      'ncc',
      'harmonised',
      'harmonized',
    ],
    note: 'Since May 2023 the NCC requires MTN, Airtel, Glo and T2 (formerly 9mobile) to use the same codes for the same job.',
    codes: [
      {
        action: 'balance',
        label: 'Check airtime balance',
        code: '*310#',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nccCodes],
      },
      {
        action: 'balance',
        label: 'Check data balance',
        code: '*323#',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nccCodes],
      },
      {
        action: 'data',
        label: 'Buy a data plan',
        code: '*312#',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nccCodes],
      },
      {
        action: 'airtime',
        label: 'Recharge with a card PIN',
        code: '*311*{pin}#',
        note: 'Type the PIN from your recharge card in place of {pin}. Never type a card PIN into any website.',
        verification: 'corroborated',
        checkedAt: CHECKED,
        sources: [S.nccCodes, S.gosub, S.naijatips],
      },
      {
        action: 'airtime',
        label: 'Borrow airtime or data',
        code: '*303#',
        note: 'Eligibility and fees depend on your network and usage.',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nccCodes],
      },
      {
        action: 'airtime',
        label: 'Share airtime or data',
        code: '*321#',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nccCodes],
      },
      {
        action: 'identity',
        label: 'Verify SIM registration and NIN link',
        code: '*996#',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nccCodes, S.nccNin],
      },
      {
        action: 'support',
        label: 'Customer care',
        code: '300',
        note: 'Call 300 from your line.',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nccCodes],
      },
      {
        action: 'support',
        label: 'Stop a subscription service',
        code: '*305#',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nccCodes],
      },
      {
        action: 'support',
        label: 'Do-not-disturb (stop unsolicited SMS)',
        code: '*2442#',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nccCodes],
      },
      {
        action: 'other',
        label: 'Move your number to another network',
        code: '*3232#',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nccCodes],
      },
    ],
  },
  {
    id: 'nibss-bvn',
    name: 'BVN services (NIBSS)',
    category: 'government',
    aliases: ['bvn', 'bank verification number', 'nibss', 'nip tracker', 'bvn check'],
    note: 'Dial from the phone number registered to your BVN. NIBSS charges a ₦20 fee per request.',
    codes: [
      {
        action: 'identity',
        label: 'Retrieve your BVN',
        code: '*565*0#',
        note: 'No BVN is returned if your number is linked to more than one BVN.',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nibss],
      },
      {
        action: 'identity',
        label: 'Validate a BVN and see its registered name',
        code: '*565*1#',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nibss],
      },
      {
        action: 'transfer',
        label: 'Track a NIP transfer (last 5)',
        code: '*565*5#',
        note: 'Only transfers completed within 48 hours, from the number tied to the sender account.',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nibss],
      },
    ],
  },
  {
    id: 'nimc-nin',
    name: 'NIN retrieval (NIMC)',
    category: 'government',
    aliases: ['nin', 'national identity number', 'nimc', 'national identity management commission'],
    note: 'Works on all networks, but only from the phone number you registered with NIMC.',
    codes: [
      {
        action: 'identity',
        label: 'Retrieve your NIN',
        code: '*346#',
        note: 'Press 1 at the prompt to retrieve your NIN.',
        verification: 'official',
        checkedAt: CHECKED,
        sources: [S.nccNin],
      },
    ],
  },
]
