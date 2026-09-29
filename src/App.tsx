import React, { useState } from 'react';
import {
  Building2,
  Package,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  XCircle,
  Copy,
  Download,
  ShieldAlert,
  PlusCircle,
  Layers,
  ArrowRight,
  Filter,
  FileCode,
  DollarSign,
  TrendingUp,
  Inbox,
  GitBranch,
  Github,
  ExternalLink,
  Terminal,
  FolderGit2
} from 'lucide-react';
import { APP_PY_CODE } from './codeString.ts';

// ==========================================
// 型定義
// ==========================================
interface User {
  id: string;
  name: string;
  role: '営業店' | '本部';
  branch: string;
}

interface Item {
  id: string;
  name: string;
  category: '一般消耗品' | '厳格管理品';
  price: number;
  stock: number;
  safeStock: number;
  unit: string;
  icon: string;
  description: string;
}

interface Order {
  orderId: string;
  branch: string;
  itemId: string;
  itemName: string;
  category: '一般消耗品' | '厳格管理品';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: '承認待ち' | '承認済（出荷手配）' | '却下';
  serialRange: string;
  applicant: string;
  date: string;
  approvedDate: string;
}

interface StrictLedgerEntry {
  ledgerId: string;
  orderId: string;
  date: string;
  branch: string;
  itemId: string;
  itemName: string;
  quantity: number;
  serialStart: string;
  serialEnd: string;
  authorizer: string;
  status: string;
}

interface BranchBudget {
  budget: number;
  used: number;
}

// ==========================================
// 初期モックデータ
// ==========================================
const INITIAL_USERS: User[] = [
  { id: 'U001', name: '新橋支店 窓口担当（鈴木）', role: '営業店', branch: '新橋支店' },
  { id: 'U002', name: '新宿支店 業務担当（高橋）', role: '営業店', branch: '新宿支店' },
  { id: 'U003', name: '本店営業部 役席（佐藤）', role: '営業店', branch: '本店営業部' },
  { id: 'U004', name: '本部 事務統括部（山田課長）', role: '本部', branch: '本部 事務統括部' },
];

const INITIAL_ITEMS: Item[] = [
  // 一般消耗品
  { id: 'G001', name: 'コピー用紙 A4（500枚×5冊箱）', category: '一般消耗品', price: 2400, stock: 45, safeStock: 20, unit: '箱', icon: '📄', description: '高白色・両面印刷対応 窓口・後方兼用' },
  { id: 'G002', name: '窓口用油性ボールペン黒（10本入）', category: '一般消耗品', price: 950, stock: 80, safeStock: 30, unit: '箱', icon: '🖊️', description: '0.7mm 低粘度油性 記入台・窓口配備用' },
  { id: 'G003', name: '金庫名入 現金封筒 大（500枚入）', category: '一般消耗品', price: 3200, stock: 18, safeStock: 25, unit: '包', icon: '✉️', description: 'ATM・窓口現金払戻用 大型サイズ' },
  { id: 'G004', name: '金庫名入 現金封筒 小（500枚入）', category: '一般消耗品', price: 2800, stock: 35, safeStock: 25, unit: '包', icon: '✉️', description: 'ATM・窓口現金払戻用 小型サイズ' },
  { id: 'G005', name: '窓口勘定科目用スタンプ台（藍）', category: '一般消耗品', price: 780, stock: 12, safeStock: 15, unit: '個', icon: '⬛', description: '速乾性・伝票押印用（藍色）' },
  { id: 'G006', name: '窓口用付箋紙セット（5色パック）', category: '一般消耗品', price: 620, stock: 90, safeStock: 40, unit: '組', icon: '📑', description: '強粘着タイプ 勘定記入・顧客案内用' },
  // 厳格管理品
  { id: 'S001', name: '総合口座通帳（磁気テープ付 100冊）', category: '厳格管理品', price: 8500, stock: 60, safeStock: 40, unit: '組(100冊)', icon: '📘', description: '高抗磁力JIS-II型 厳格管理・要シリアル追跡' },
  { id: 'S002', name: '普通預金通帳（ICチップ搭載 100冊）', category: '厳格管理品', price: 9800, stock: 25, safeStock: 30, unit: '組(100冊)', icon: '📗', description: 'ICチップ内蔵 高セキュリティ通帳' },
  { id: 'S003', name: '定期預金通帳（100冊）', category: '厳格管理品', price: 7600, stock: 38, safeStock: 20, unit: '組(100冊)', icon: '📙', description: '定期性預金専用 厳格管理対象' },
  { id: 'S004', name: '当座手形用紙（50枚綴×5冊組）', category: '厳格管理品', price: 12000, stock: 15, safeStock: 20, unit: '組', icon: '📋', description: '統一用紙規格 本部金庫厳封保管品' },
  { id: 'S005', name: '為替小切手用紙（50枚綴×5冊組）', category: '厳格管理品', price: 11500, stock: 22, safeStock: 15, unit: '組', icon: '📋', description: '線引小切手対応 本部金庫厳封保管品' },
];

const INITIAL_ORDERS: Order[] = [
  {
    orderId: 'ORD-2026-001',
    branch: '新橋支店',
    itemId: 'G001',
    itemName: 'コピー用紙 A4（500枚×5冊箱）',
    category: '一般消耗品',
    quantity: 3,
    unitPrice: 2400,
    totalPrice: 7200,
    status: '承認済（出荷手配）',
    serialRange: '-',
    applicant: '新橋支店 窓口担当（鈴木）',
    date: '2026-09-18 10:15',
    approvedDate: '2026-09-18 13:40',
  },
  {
    orderId: 'ORD-2026-002',
    branch: '新橋支店',
    itemId: 'S001',
    itemName: '総合口座通帳（磁気テープ付 100冊）',
    category: '厳格管理品',
    quantity: 2,
    unitPrice: 8500,
    totalPrice: 17000,
    status: '承認済（出荷手配）',
    serialRange: 'TK-2026-0101 〜 TK-2026-0300',
    applicant: '新橋支店 窓口担当（鈴木）',
    date: '2026-09-20 14:30',
    approvedDate: '2026-09-21 09:15',
  },
  {
    orderId: 'ORD-2026-003',
    branch: '新宿支店',
    itemId: 'G003',
    itemName: '金庫名入 現金封筒 大（500枚入）',
    category: '一般消耗品',
    quantity: 2,
    unitPrice: 3200,
    totalPrice: 6400,
    status: '承認待ち',
    serialRange: '-',
    applicant: '新宿支店 業務担当（高橋）',
    date: '2026-09-24 16:00',
    approvedDate: '-',
  },
  {
    orderId: 'ORD-2026-004',
    branch: '新橋支店',
    itemId: 'S002',
    itemName: '普通預金通帳（ICチップ搭載 100冊）',
    category: '厳格管理品',
    quantity: 1,
    unitPrice: 9800,
    totalPrice: 9800,
    status: '承認待ち',
    serialRange: '-',
    applicant: '新橋支店 窓口担当（鈴木）',
    date: '2026-09-25 09:20',
    approvedDate: '-',
  },
  {
    orderId: 'ORD-2026-005',
    branch: '本店営業部',
    itemId: 'S004',
    itemName: '当座手形用紙（50枚綴×5冊組）',
    category: '厳格管理品',
    quantity: 1,
    unitPrice: 12000,
    totalPrice: 12000,
    status: '承認待ち',
    serialRange: '-',
    applicant: '本店営業部 役席（佐藤）',
    date: '2026-09-25 10:05',
    approvedDate: '-',
  },
];

const INITIAL_STRICT_LEDGER: StrictLedgerEntry[] = [
  {
    ledgerId: 'LED-2026-081',
    orderId: 'ORD-2026-002',
    date: '2026-09-21',
    branch: '新橋支店',
    itemId: 'S001',
    itemName: '総合口座通帳（磁気テープ付 100冊）',
    quantity: 2,
    serialStart: 'TK-2026-0101',
    serialEnd: 'TK-2026-0300',
    authorizer: '本部 事務統括部（山田課長）',
    status: '営業店受領済',
  },
  {
    ledgerId: 'LED-2026-075',
    orderId: 'ORD-2026-PREV',
    date: '2026-09-10',
    branch: '新宿支店',
    itemId: 'S002',
    itemName: '普通預金通帳（ICチップ搭載 100冊）',
    quantity: 1,
    serialStart: 'IC-2026-0001',
    serialEnd: 'IC-2026-0100',
    authorizer: '本部 事務統括部（山田課長）',
    status: '営業店受領済',
  },
  {
    ledgerId: 'LED-2026-068',
    orderId: 'ORD-2026-PREV2',
    date: '2026-09-05',
    branch: '本店営業部',
    itemId: 'S004',
    itemName: '当座手形用紙（50枚綴×5冊組）',
    quantity: 2,
    serialStart: 'TE-2026-5001',
    serialEnd: 'TE-2026-5500',
    authorizer: '本部 事務統括部（山田課長）',
    status: '営業店受領済',
  },
];

const INITIAL_BUDGETS: Record<string, BranchBudget> = {
  '新橋支店': { budget: 150000, used: 98500 },
  '新宿支店': { budget: 180000, used: 142000 },
  '本店営業部': { budget: 300000, used: 215000 },
  '渋谷支店': { budget: 160000, used: 110000 },
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'order' | 'approval' | 'ledger' | 'code' | 'github'>('dashboard');
  
  // マスタ & 業務データ
  const [items, setItems] = useState<Item[]>(INITIAL_ITEMS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [strictLedger, setStrictLedger] = useState<StrictLedgerEntry[]>(INITIAL_STRICT_LEDGER);
  const [budgets, setBudgets] = useState<Record<string, BranchBudget>>(INITIAL_BUDGETS);

  // 発注画面の状態
  const [orderTab, setOrderTab] = useState<'general' | 'strict'>('general');
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // 承認画面の状態
  const [selectedApprovalOrderId, setSelectedApprovalOrderId] = useState<string | null>(null);
  const [serialInput, setSerialInput] = useState<string>('');
  const [approvalFeedback, setApprovalFeedback] = useState<string | null>(null);

  // 台帳画面の状態
  const [ledgerBranchFilter, setLedgerBranchFilter] = useState<string>('全店舗');
  const [ledgerItemFilter, setLedgerItemFilter] = useState<string>('全品目');
  const [replenishItemId, setReplenishItemId] = useState<string>('G001');
  const [replenishQty, setReplenishQty] = useState<number>(50);
  const [replenishMsg, setReplenishMsg] = useState<string | null>(null);

  // コード表示・コピー状態
  const [copied, setCopied] = useState<boolean>(false);
  const [gitCopied, setGitCopied] = useState<string | null>(null);

  // 承認待ち件数 & 安全在庫割れ件数
  const pendingOrders = orders.filter((o) => o.status === '承認待ち');
  const shortageItems = items.filter((i) => i.stock <= i.safeStock);

  // 数量変更ハンドラ
  const handleQuantityChange = (itemId: string, val: number) => {
    setOrderQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, Math.min(20, val)),
    }));
  };

  // 発注申請ハンドラ
  const handleApplyOrder = (item: Item) => {
    const qty = orderQuantities[item.id] || 1;
    const total = qty * item.price;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newOrderId = `ORD-2026-${String(orders.length + 1).padStart(3, '0')}`;

    const newOrder: Order = {
      orderId: newOrderId,
      branch: currentUser.branch,
      itemId: item.id,
      itemName: item.name,
      category: item.category,
      quantity: qty,
      unitPrice: item.price,
      totalPrice: total,
      status: '承認待ち',
      serialRange: item.category === '厳格管理品' ? '（本部承認時割当）' : '-',
      applicant: currentUser.name,
      date: dateStr,
      approvedDate: '-',
    };

    setOrders([newOrder, ...orders]);

    // 予算更新
    if (budgets[currentUser.branch]) {
      setBudgets((prev) => ({
        ...prev,
        [currentUser.branch]: {
          ...prev[currentUser.branch],
          used: prev[currentUser.branch].used + total,
        },
      }));
    }

    setOrderSuccessMsg(`【発注申請完了】${item.name} (${qty}${item.unit}) を申請しました。発注ID: ${newOrderId}`);
    setTimeout(() => setOrderSuccessMsg(null), 4000);
  };

  // 承認ハンドラ
  const handleApprove = (order: Order, assignedSerial: string) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 1. 注文ステータス更新
    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === order.orderId
          ? {
              ...o,
              status: '承認済（出荷手配）',
              serialRange: order.category === '厳格管理品' ? assignedSerial : '-',
              approvedDate: dateStr,
            }
          : o
      )
    );

    // 2. 在庫数削減
    setItems((prev) =>
      prev.map((i) =>
        i.id === order.itemId ? { ...i, stock: Math.max(0, i.stock - order.quantity) } : i
      )
    );

    // 3. 厳格管理品なら台帳登録
    if (order.category === '厳格管理品') {
      const parts = assignedSerial.split('〜').map((s) => s.trim());
      const sStart = parts[0] || assignedSerial;
      const sEnd = parts[1] || assignedSerial;

      const newLedger: StrictLedgerEntry = {
        ledgerId: `LED-2026-${String(strictLedger.length + 1).padStart(3, '0')}`,
        orderId: order.orderId,
        date: dateStr.split(' ')[0],
        branch: order.branch,
        itemId: order.itemId,
        itemName: order.itemName,
        quantity: order.quantity,
        serialStart: sStart,
        serialEnd: sEnd,
        authorizer: currentUser.name,
        status: '本部払出済（配送便）',
      };
      setStrictLedger([newLedger, ...strictLedger]);
    }

    setApprovalFeedback(`発注ID ${order.orderId} を承認・出荷手配しました。`);
    setSelectedApprovalOrderId(null);
    setTimeout(() => setApprovalFeedback(null), 3000);
  };

  // 却下ハンドラ
  const handleReject = (order: Order) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setOrders((prev) =>
      prev.map((o) =>
        o.orderId === order.orderId
          ? {
              ...o,
              status: '却下',
              approvedDate: dateStr,
            }
          : o
      )
    );

    // 予算枠の返還
    if (budgets[order.branch]) {
      setBudgets((prev) => ({
        ...prev,
        [order.branch]: {
          ...prev[order.branch],
          used: Math.max(0, prev[order.branch].used - order.totalPrice),
        },
      }));
    }

    setApprovalFeedback(`発注ID ${order.orderId} を却下（差戻し）しました。`);
    setSelectedApprovalOrderId(null);
    setTimeout(() => setApprovalFeedback(null), 3000);
  };

  // 在庫補充ハンドラ
  const handleReplenish = (e: React.FormEvent) => {
    e.preventDefault();
    setItems((prev) =>
      prev.map((i) =>
        i.id === replenishItemId ? { ...i, stock: i.stock + replenishQty } : i
      )
    );
    const target = items.find((i) => i.id === replenishItemId);
    setReplenishMsg(`${target?.name} を ${replenishQty}${target?.unit} 入庫補充しました。`);
    setTimeout(() => setReplenishMsg(null), 3000);
  };

  // CSVエクスポート
  const handleDownloadCSV = () => {
    const headers = ['台帳ID,払出年月日,払出先営業店,品名,数量,開始シリアル,終了シリアル,承認者,現物ステータス'];
    const rows = strictLedger.map(
      (l) => `${l.ledgerId},${l.date},${l.branch},"${l.itemName}",${l.quantity},${l.serialStart},${l.serialEnd},"${l.authorizer}",${l.status}`
    );
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `shinkin_strict_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pythonコード全文（codeString.tsよりインポート）
  const pythonCode = APP_PY_CODE;

  const handleCopyCmd = (cmd: string, key: string) => {
    navigator.clipboard.writeText(cmd);
    setGitCopied(key);
    setTimeout(() => setGitCopied(null), 2500);
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      {/* ==========================================
          左サイドバー
         ========================================== */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col justify-between shrink-0 border-r border-slate-800 select-none">
        <div>
          {/* 金庫ヘッダー */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-bold text-sm text-white tracking-wide">西都信用金庫</div>
                <div className="text-xs text-slate-400">用品発注・厳格管理システム</div>
              </div>
            </div>
          </div>

          {/* ログインユーザー切替 */}
          <div className="p-4 border-b border-slate-800">
            <label className="text-xs font-semibold text-slate-400 block mb-1.5">
              👤 ログインユーザー切替
            </label>
            <select
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded-md p-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              value={currentUser.id}
              onChange={(e) => {
                const user = INITIAL_USERS.find((u) => u.id === e.target.value);
                if (user) setCurrentUser(user);
              }}
            >
              {INITIAL_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} [{u.role}]
                </option>
              ))}
            </select>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>所属: {currentUser.branch}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${currentUser.role === '本部' ? 'bg-amber-900/60 text-amber-300' : 'bg-emerald-900/60 text-emerald-300'}`}>
                {currentUser.role}権限
              </span>
            </div>
          </div>

          {/* ナビゲーションメニュー */}
          <nav className="p-3 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 px-3 py-1">業務メニュー</div>
            
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                activeMenu === 'dashboard'
                  ? 'bg-amber-500/20 text-amber-300 border-l-2 border-amber-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>① ダッシュボード</span>
            </button>

            <button
              onClick={() => setActiveMenu('order')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                activeMenu === 'order'
                  ? 'bg-amber-500/20 text-amber-300 border-l-2 border-amber-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>② 用品発注（営業店）</span>
            </button>

            <button
              onClick={() => setActiveMenu('approval')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                activeMenu === 'approval'
                  ? 'bg-amber-500/20 text-amber-300 border-l-2 border-amber-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4" />
                <span>③ 承認・出荷（本部）</span>
              </div>
              {pendingOrders.length > 0 && (
                <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                  {pendingOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu('ledger')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                activeMenu === 'ledger'
                  ? 'bg-amber-500/20 text-amber-300 border-l-2 border-amber-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>④ 在庫・厳格台帳（本部）</span>
            </button>

            <div className="pt-2 border-t border-slate-800 mt-2 space-y-1">
              <button
                onClick={() => setActiveMenu('code')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                  activeMenu === 'code'
                    ? 'bg-sky-500/20 text-sky-300 border-l-2 border-sky-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileCode className="w-4 h-4 text-sky-400" />
                <span>Python app.py ソース</span>
              </button>

              <button
                onClick={() => setActiveMenu('github')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                  activeMenu === 'github'
                    ? 'bg-violet-500/20 text-violet-300 border-l-2 border-violet-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Github className="w-4 h-4 text-violet-400" />
                <span>GitHub公開・連携</span>
              </button>
            </div>
          </nav>
        </div>

        {/* サイドバー下部インジケータ */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>未処理の申請</span>
            <span className="font-mono text-amber-400 font-semibold">{pendingOrders.length} 件</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>安全在庫割れ品目</span>
            <span className="font-mono text-rose-400 font-semibold">{shortageItems.length} 品目</span>
          </div>
          <div className="pt-1 text-[10px] text-slate-400 text-center">
            内部統制・厳格管理規則 準拠
          </div>
        </div>
      </aside>

      {/* ==========================================
          メインコンテンツエリア
         ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* トップバー */}
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-800 tracking-tight">
              信用金庫 用品受発注・厳格管理台帳システム
            </h1>
            <span className="text-xs text-slate-500 hidden md:inline">
              | {currentUser.branch}（{currentUser.name}）
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveMenu('github')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
            >
              <Github className="w-3.5 h-3.5 text-white" />
              <span>GitHubで見る / 公開</span>
            </button>
            <button
              onClick={() => setActiveMenu('code')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-600" />
              <span>Streamlit app.py</span>
            </button>
            <div className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
              {currentUser.role === '本部' ? '🏛️ 本部管理者' : '🏢 営業店'}
            </div>
          </div>
        </header>

        {/* メインビュー */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* ==========================================
              画面①：ダッシュボード
             ========================================== */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              {currentUser.role === '営業店' ? (
                /* 営業店ダッシュボード */
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {currentUser.branch} 用品執行状況ダッシュボード
                      </h2>
                      <p className="text-xs text-slate-500">
                        今月の消耗品予算消化状況および自店舗の発注ステータスです。
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveMenu('order')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 transition"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>新規用品発注を行う</span>
                    </button>
                  </div>

                  {/* 予算メトリクスカード */}
                  {(() => {
                    const b = budgets[currentUser.branch] || { budget: 150000, used: 50000 };
                    const rate = Math.min(100, Math.round((b.used / b.budget) * 100));
                    const remaining = b.budget - b.used;

                    return (
                      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                          <div className="px-2">
                            <span className="text-xs text-slate-500 block">当月設定予算額</span>
                            <span className="text-xl font-bold font-mono text-slate-900">¥{b.budget.toLocaleString()}</span>
                          </div>
                          <div className="px-2 pt-2 md:pt-0">
                            <span className="text-xs text-slate-500 block">当月執行額（承認済+手配中）</span>
                            <span className="text-xl font-bold font-mono text-slate-900">¥{b.used.toLocaleString()}</span>
                          </div>
                          <div className="px-2 pt-2 md:pt-0">
                            <span className="text-xs text-slate-500 block">今月残予算</span>
                            <span className={`text-xl font-bold font-mono ${remaining < 20000 ? 'text-rose-600' : 'text-emerald-700'}`}>
                              ¥{remaining.toLocaleString()}
                            </span>
                          </div>
                          <div className="px-2 pt-2 md:pt-0">
                            <span className="text-xs text-slate-500 block">今月の予算消化率</span>
                            <span className="text-xl font-bold font-mono text-slate-900">{rate}%</span>
                          </div>
                        </div>

                        {/* プログレスバー */}
                        <div className="space-y-1.5 pt-2">
                          <div className="flex justify-between text-xs text-slate-600">
                            <span>予算進捗状況</span>
                            <span className="font-semibold">{rate}% 消化（{rate < 80 ? '正常枠内' : rate < 100 ? '予算消化注意' : '予算到達'}）</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                rate > 90 ? 'bg-rose-500' : rate > 75 ? 'bg-amber-500' : 'bg-emerald-600'
                              }`}
                              style={{ width: `${Math.min(100, rate)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 自身の申請ステータス一覧 */}
                  <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-slate-800">自店舗の発注申請履歴</h3>
                      <div className="flex gap-4 text-xs text-slate-600">
                        <span>
                          承認待ち: <strong className="text-amber-600 font-mono">{orders.filter(o => o.branch === currentUser.branch && o.status === '承認待ち').length}</strong> 件
                        </span>
                        <span>
                          承認済: <strong className="text-emerald-600 font-mono">{orders.filter(o => o.branch === currentUser.branch && o.status === '承認済（出荷手配）').length}</strong> 件
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200 font-medium">
                          <tr>
                            <th className="py-2.5 px-3">発注ID</th>
                            <th className="py-2.5 px-3">申請日時</th>
                            <th className="py-2.5 px-3">品名</th>
                            <th className="py-2.5 px-3">種別</th>
                            <th className="py-2.5 px-3 text-right">数量</th>
                            <th className="py-2.5 px-3 text-right">金額</th>
                            <th className="py-2.5 px-3">ステータス</th>
                            <th className="py-2.5 px-3">割当シリアル番号</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orders.filter((o) => o.branch === currentUser.branch).length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center py-6 text-slate-400">
                                発注データはありません
                              </td>
                            </tr>
                          ) : (
                            orders
                              .filter((o) => o.branch === currentUser.branch)
                              .map((o) => (
                                <tr key={o.orderId} className="hover:bg-slate-50/80">
                                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{o.orderId}</td>
                                  <td className="py-2.5 px-3 text-slate-500">{o.date}</td>
                                  <td className="py-2.5 px-3 font-medium text-slate-800">{o.itemName}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                      o.category === '厳格管理品' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {o.category}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono">{o.quantity}</td>
                                  <td className="py-2.5 px-3 text-right font-mono font-medium">¥{o.totalPrice.toLocaleString()}</td>
                                  <td className="py-2.5 px-3">
                                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                      o.status === '承認待ち'
                                        ? 'bg-amber-100 text-amber-800'
                                        : o.status === '承認済（出荷手配）'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}>
                                      {o.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                                    {o.serialRange}
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                /* 本部管理者ダッシュボード */
                <>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      本部 事務統括部 全店用品管理ダッシュボード
                    </h2>
                    <p className="text-xs text-slate-500">
                      全営業店の予算消化状況・承認キューおよび安全在庫割れモニタリングです。
                    </p>
                  </div>

                  {/* 本部サマリーメトリクス */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
                      <span className="text-xs text-slate-500 block mb-1">承認待ち 申請件数</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold font-mono text-amber-600">{pendingOrders.length}</span>
                        <span className="text-xs text-slate-400">要役席審査</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
                      <span className="text-xs text-slate-500 block mb-1">在庫不足アラート品目</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold font-mono text-rose-600">{shortageItems.length}</span>
                        <span className="text-xs text-slate-400">安全在庫割れ</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
                      <span className="text-xs text-slate-500 block mb-1">全店月間発注累計</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold font-mono text-slate-800">
                          ¥{orders.filter(o => o.status !== '却下').reduce((acc, c) => acc + c.totalPrice, 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400">当月執行</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
                      <span className="text-xs text-slate-500 block mb-1">厳格管理品 払出件数</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-bold font-mono text-slate-800">{strictLedger.length}</span>
                        <span className="text-xs text-slate-400">台帳追跡中</span>
                      </div>
                    </div>
                  </div>

                  {/* 在庫不足アラートセクション */}
                  {shortageItems.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 text-rose-800 text-sm font-bold">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>在庫不足（安全在庫割れ）アラート</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left bg-white rounded border border-rose-100">
                          <thead className="bg-rose-100/50 text-rose-900 font-semibold">
                            <tr>
                              <th className="p-2.5">用品ID</th>
                              <th className="p-2.5">品名</th>
                              <th className="p-2.5">カテゴリ</th>
                              <th className="p-2.5 text-right">現在庫</th>
                              <th className="p-2.5 text-right">安全在庫</th>
                              <th className="p-2.5">単価</th>
                              <th className="p-2.5">状況</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-rose-50">
                            {shortageItems.map((item) => (
                              <tr key={item.id}>
                                <td className="p-2.5 font-mono font-medium">{item.id}</td>
                                <td className="p-2.5 font-medium">{item.name}</td>
                                <td className="p-2.5">{item.category}</td>
                                <td className="p-2.5 text-right font-mono font-bold text-rose-600">{item.stock} {item.unit}</td>
                                <td className="p-2.5 text-right font-mono text-slate-500">{item.safeStock} {item.unit}</td>
                                <td className="p-2.5 font-mono">¥{item.price.toLocaleString()}</td>
                                <td className="p-2.5">
                                  <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                                    仕入補充要
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* 全営業店の予算消化状況 */}
                  <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">全営業店 当月予算消化状況</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">店舗名</th>
                            <th className="py-2.5 px-3 text-right">月間予算額</th>
                            <th className="py-2.5 px-3 text-right">当月消化額</th>
                            <th className="py-2.5 px-3 text-right">残予算額</th>
                            <th className="py-2.5 px-3">消化進捗率</th>
                            <th className="py-2.5 px-3">判定</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {Object.entries(budgets).map(([branch, bdata]) => {
                            const rate = Math.round((bdata.used / bdata.budget) * 100);
                            return (
                              <tr key={branch} className="hover:bg-slate-50/80">
                                <td className="py-2.5 px-3 font-semibold text-slate-900">{branch}</td>
                                <td className="py-2.5 px-3 text-right font-mono">¥{bdata.budget.toLocaleString()}</td>
                                <td className="py-2.5 px-3 text-right font-mono">¥{bdata.used.toLocaleString()}</td>
                                <td className="py-2.5 px-3 text-right font-mono">¥{(bdata.budget - bdata.used).toLocaleString()}</td>
                                <td className="py-2.5 px-3 w-48">
                                  <div className="flex items-center gap-2">
                                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                      <div
                                        className={`h-full ${rate > 85 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                                        style={{ width: `${Math.min(100, rate)}%` }}
                                      />
                                    </div>
                                    <span className="font-mono text-[11px] text-slate-600">{rate}%</span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                                    rate < 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {rate < 80 ? '順調' : '要モニタリング'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==========================================
              画面②：用品発注画面（営業店向け）
             ========================================== */}
          {activeMenu === 'order' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">用品発注カタログ（営業店用）</h2>
                  <p className="text-xs text-slate-500">
                    発注申請店舗: <strong className="text-slate-800">{currentUser.branch}</strong> ｜ 申請者: {currentUser.name}
                  </p>
                </div>
              </div>

              {orderSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{orderSuccessMsg}</span>
                </div>
              )}

              {/* タブ切替 */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setOrderTab('general')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                    orderTab === 'general'
                      ? 'border-slate-900 text-slate-900 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>一般消耗品カタログ</span>
                </button>
                <button
                  onClick={() => setOrderTab('strict')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                    orderTab === 'strict'
                      ? 'border-amber-600 text-amber-900 bg-amber-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>厳格管理品カタログ（通帳・手形用紙等）</span>
                </button>
              </div>

              {/* 厳格管理品の警告バナー */}
              {orderTab === 'strict' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">厳格管理品 発注時の遵守事項</strong>
                    通帳・証書・手形用紙等の厳格管理品は、本部役席によるシリアル番号割当および厳封配送が行われます。受領時は金庫管理者立会のもと現物照合検収を行ってください。
                  </div>
                </div>
              )}

              {/* カタログカード一覧 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items
                  .filter((i) => (orderTab === 'general' ? i.category === '一般消耗品' : i.category === '厳格管理品'))
                  .map((item) => {
                    const qty = orderQuantities[item.id] || 1;
                    const total = qty * item.price;
                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-lg border p-4 shadow-xs flex flex-col justify-between transition-all ${
                          item.category === '厳格管理品' ? 'border-amber-200 hover:border-amber-400' : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <div>
                          {/* モック画像プレビュー枠 */}
                          <div className={`h-24 rounded border flex flex-col items-center justify-center mb-3 ${
                            item.category === '厳格管理品' ? 'bg-amber-50/60 border-amber-200 text-amber-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}>
                            <span className="text-3xl mb-1">{item.icon}</span>
                            <span className="text-[11px] font-mono font-medium">
                              [{item.id}] {item.unit}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-bold text-xs text-slate-900 leading-snug">{item.name}</h4>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] shrink-0 font-medium ${
                              item.category === '厳格管理品' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {item.category}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 mb-3">{item.description}</p>

                          <div className="flex items-baseline justify-between text-xs mb-3 pb-2 border-b border-slate-100">
                            <span className="text-slate-500">本部在庫残高:</span>
                            <span className={`font-mono font-medium ${item.stock <= item.safeStock ? 'text-rose-600' : 'text-slate-800'}`}>
                              {item.stock} {item.unit}
                            </span>
                          </div>
                        </div>

                        {/* 数量入力 & 発注ボタン */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">単価: ¥{item.price.toLocaleString()}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 text-[11px]">数量:</span>
                              <input
                                type="number"
                                min={1}
                                max={item.category === '厳格管理品' ? 5 : 20}
                                value={qty}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 text-center font-mono text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs font-semibold pt-1">
                            <span className="text-slate-600">小計:</span>
                            <span className="font-mono text-slate-900">¥{total.toLocaleString()}</span>
                          </div>

                          <button
                            onClick={() => handleApplyOrder(item)}
                            className={`w-full py-2 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                              item.category === '厳格管理品'
                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                            }`}
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>発注申請する</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ==========================================
              画面③：承認・出荷管理画面（本部向け）
             ========================================== */}
          {activeMenu === 'approval' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">承認・出荷手配管理（本部用）</h2>
                  <p className="text-xs text-slate-500">
                    各営業店から申請された用品発注の審査、および厳格管理品のシリアル番号割当出荷を行います。
                  </p>
                </div>
                {currentUser.role !== '本部' && (
                  <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded">
                    ※現在は「営業店」権限で閲覧中（本部権限に切り替えてテスト可能）
                  </span>
                )}
              </div>

              {approvalFeedback && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{approvalFeedback}</span>
                </div>
              )}

              {/* 承認待ち一覧 */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>承認待ち申請一覧（{pendingOrders.length}件）</span>
                  </h3>
                </div>

                {pendingOrders.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    現在、承認待ちの発注申請はありません。
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">発注ID</th>
                          <th className="py-2.5 px-3">申請日時</th>
                          <th className="py-2.5 px-3">店舗名</th>
                          <th className="py-2.5 px-3">品名</th>
                          <th className="py-2.5 px-3">種別</th>
                          <th className="py-2.5 px-3 text-right">数量</th>
                          <th className="py-2.5 px-3 text-right">金額</th>
                          <th className="py-2.5 px-3">申請者</th>
                          <th className="py-2.5 px-3 text-center">審査アクション</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingOrders.map((o) => (
                          <tr key={o.orderId} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{o.orderId}</td>
                            <td className="py-2.5 px-3 text-slate-500">{o.date}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{o.branch}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">{o.itemName}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                o.category === '厳格管理品' ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {o.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">{o.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-medium">¥{o.totalPrice.toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-slate-600">{o.applicant}</td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => {
                                  setSelectedApprovalOrderId(o.orderId);
                                  // シリアル自動サジェスト
                                  const prefix = o.itemName.includes('総合口座') ? 'TK-2026-' : (o.itemName.includes('IC') ? 'IC-2026-' : 'TE-2026-');
                                  setSerialInput(`${prefix}0301 〜 ${prefix}${String(300 + o.quantity * 100).padStart(4, '0')}`);
                                }}
                                className="px-3 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded text-[11px] font-medium transition"
                              >
                                審査を開く
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 個別審査モーダル / インラインカード */}
              {selectedApprovalOrderId && (() => {
                const target = pendingOrders.find((o) => o.orderId === selectedApprovalOrderId);
                if (!target) return null;
                const isStrict = target.category === '厳格管理品';

                return (
                  <div className="bg-white rounded-lg border-2 border-slate-900 p-5 shadow-md space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-xs text-slate-500 font-mono">発注審査ウィンドウ</span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {target.orderId} - {target.branch} からの申請
                        </h4>
                      </div>
                      <button
                        onClick={() => setSelectedApprovalOrderId(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded">
                      <div>
                        <span className="text-slate-500 block">品名</span>
                        <span className="font-semibold text-slate-800">{target.itemName}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">申請数量</span>
                        <span className="font-semibold font-mono text-slate-800">{target.quantity}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">合計金額</span>
                        <span className="font-semibold font-mono text-slate-800">¥{target.totalPrice.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">申請担当者</span>
                        <span className="font-semibold text-slate-800">{target.applicant}</span>
                      </div>
                    </div>

                    {/* 厳格管理品用シリアルナンバー入力 */}
                    {isStrict ? (
                      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          <span>厳格管理品 シリアルナンバー割当（重要）</span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          金庫から出納する現物通帳・手形の記号番号帯（例: TK-2026-0301 〜 TK-2026-0500）を入力してください。
                        </p>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={serialInput}
                            onChange={(e) => setSerialInput(e.target.value)}
                            placeholder="例: TK-2026-0301 〜 TK-2026-0500"
                            className="flex-1 px-3 py-1.5 text-xs font-mono border border-amber-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    ) : null}

                    {/* 操作ボタン */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        onClick={() => handleReject(target)}
                        className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded text-xs font-semibold transition"
                      >
                        却下・差戻し
                      </button>
                      <button
                        onClick={() => handleApprove(target, serialInput)}
                        className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>承認して出荷手配を完了する</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 直近の処理済み履歴 */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-800">処理済み発注履歴（全店）</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200">
                      <tr>
                        <th className="py-2 px-3">発注ID</th>
                        <th className="py-2 px-3">処理日時</th>
                        <th className="py-2 px-3">店舗名</th>
                        <th className="py-2 px-3">品名</th>
                        <th className="py-2 px-3 text-right">数量</th>
                        <th className="py-2 px-3 text-right">金額</th>
                        <th className="py-2 px-3">ステータス</th>
                        <th className="py-2 px-3">割当シリアル</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders
                        .filter((o) => o.status !== '承認待ち')
                        .map((o) => (
                          <tr key={o.orderId} className="hover:bg-slate-50/80">
                            <td className="py-2 px-3 font-mono font-medium text-slate-900">{o.orderId}</td>
                            <td className="py-2 px-3 text-slate-500">{o.approvedDate}</td>
                            <td className="py-2 px-3 font-medium text-slate-800">{o.branch}</td>
                            <td className="py-2 px-3 text-slate-800">{o.itemName}</td>
                            <td className="py-2 px-3 text-right font-mono">{o.quantity}</td>
                            <td className="py-2 px-3 text-right font-mono">¥{o.totalPrice.toLocaleString()}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                o.status === '承認済（出荷手配）' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-600">{o.serialRange}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              画面④：在庫・厳格管理台帳（本部向け）
             ========================================== */}
          {activeMenu === 'ledger' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">在庫マスタ ＆ 厳格管理品受払台帳</h2>
                  <p className="text-xs text-slate-500">
                    本部センター在庫状況の照会、仕入補充、および厳格管理品の営業店別シリアル番号追跡台帳です。
                  </p>
                </div>
              </div>

              {/* 1. 在庫一覧テーブル */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-700" />
                    <span>本部全用品 在庫管理マスタ</span>
                  </h3>
                  {/* 在庫補充クイックフォーム */}
                  <form onSubmit={handleReplenish} className="flex items-center gap-2">
                    <select
                      value={replenishItemId}
                      onChange={(e) => setReplenishItemId(e.target.value)}
                      className="text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none"
                    >
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>
                          [{i.id}] {i.name} (残:{i.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={5}
                      max={500}
                      step={5}
                      value={replenishQty}
                      onChange={(e) => setReplenishQty(parseInt(e.target.value) || 10)}
                      className="w-16 text-xs border border-slate-300 rounded px-2 py-1 text-center font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 transition"
                    >
                      入庫補充
                    </button>
                  </form>
                </div>

                {replenishMsg && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs">
                    {replenishMsg}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">用品ID</th>
                        <th className="py-2.5 px-3">品目名</th>
                        <th className="py-2.5 px-3">区分</th>
                        <th className="py-2.5 px-3 text-right">単価</th>
                        <th className="py-2.5 px-3 text-right">現在庫数</th>
                        <th className="py-2.5 px-3 text-right">安全在庫</th>
                        <th className="py-2.5 px-3 text-right">在庫総評価額</th>
                        <th className="py-2.5 px-3 text-center">判定</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{item.id}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{item.name}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              item.category === '厳格管理品' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {item.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">¥{item.price.toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {item.stock} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                            {item.safeStock} {item.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            ¥{(item.price * item.stock).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              item.stock <= item.safeStock
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {item.stock <= item.safeStock ? '🚨 不足' : '適正'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. 厳格管理品受払台帳 */}
              <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>厳格管理品（通帳等）営業店払出履歴台帳</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      金融検査・内部監査対応用シリアル番号追跡レコード
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 店舗フィルタ */}
                    <select
                      value={ledgerBranchFilter}
                      onChange={(e) => setLedgerBranchFilter(e.target.value)}
                      className="text-xs border border-slate-300 rounded px-2.5 py-1 bg-white focus:outline-none"
                    >
                      <option value="全店舗">全店舗</option>
                      {Array.from(new Set(strictLedger.map((l) => l.branch))).map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>

                    {/* 品目フィルタ */}
                    <select
                      value={ledgerItemFilter}
                      onChange={(e) => setLedgerItemFilter(e.target.value)}
                      className="text-xs border border-slate-300 rounded px-2.5 py-1 bg-white focus:outline-none"
                    >
                      <option value="全品目">全品目</option>
                      {Array.from(new Set(strictLedger.map((l) => l.itemName))).map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>

                    {/* CSVダウンロード */}
                    <button
                      onClick={handleDownloadCSV}
                      className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>CSV保存</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 uppercase border-y border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">台帳ID</th>
                        <th className="py-2.5 px-3">払出年月日</th>
                        <th className="py-2.5 px-3">払出先営業店</th>
                        <th className="py-2.5 px-3">厳格管理品名</th>
                        <th className="py-2.5 px-3 text-right">数量</th>
                        <th className="py-2.5 px-3">開始シリアル</th>
                        <th className="py-2.5 px-3">終了シリアル</th>
                        <th className="py-2.5 px-3">本部承認役席</th>
                        <th className="py-2.5 px-3">現物ステータス</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {strictLedger
                        .filter((l) => ledgerBranchFilter === '全店舗' || l.branch === ledgerBranchFilter)
                        .filter((l) => ledgerItemFilter === '全品目' || l.itemName === ledgerItemFilter)
                        .map((entry) => (
                          <tr key={entry.ledgerId} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{entry.ledgerId}</td>
                            <td className="py-2.5 px-3 text-slate-600">{entry.date}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{entry.branch}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-800">{entry.itemName}</td>
                            <td className="py-2.5 px-3 text-right font-mono">{entry.quantity}</td>
                            <td className="py-2.5 px-3 font-mono text-amber-900 bg-amber-50/50">{entry.serialStart}</td>
                            <td className="py-2.5 px-3 font-mono text-amber-900 bg-amber-50/50">{entry.serialEnd}</td>
                            <td className="py-2.5 px-3 text-slate-600">{entry.authorizer}</td>
                            <td className="py-2.5 px-3">
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-medium">
                                {entry.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              画面⑤：Python (Streamlit) app.py ソースコード
             ========================================== */}
          {activeMenu === 'code' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Python Streamlit 完全実装コード (`app.py`)</h2>
                  <p className="text-xs text-slate-500">
                    コピペしてローカル環境（`streamlit run app.py`）で即座に実行できる完全な単一ファイルコードです。
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pythonCode);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2500);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'コピーしました！' : 'コードをコピー'}</span>
                  </button>
                  <a
                    href="/app.py"
                    download="app.py"
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded text-xs font-semibold hover:bg-emerald-800 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>app.py をダウンロード</span>
                  </a>
                </div>
              </div>

              {/* 実行手順ガイド */}
              <div className="bg-slate-900 text-slate-300 rounded-lg p-4 font-mono text-xs space-y-2">
                <div className="text-amber-400 font-semibold"># ローカル実行手順:</div>
                <div>1. 必要なライブラリのインストール: <code className="bg-slate-800 text-white px-2 py-0.5 rounded">pip install streamlit pandas</code></div>
                <div>2. アプリケーションの起動: <code className="bg-slate-800 text-white px-2 py-0.5 rounded">streamlit run app.py</code></div>
              </div>

              {/* コードプレビュー */}
              <div className="bg-slate-950 text-slate-200 rounded-lg p-5 font-mono text-xs overflow-x-auto max-h-[600px] border border-slate-800">
                <pre>{pythonCode}</pre>
              </div>
            </div>
          )}

          {/* ==========================================
              画面⑥：GitHub公開・連携ガイド
             ========================================== */}
          {activeMenu === 'github' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Github className="w-5 h-5 text-slate-900" />
                    <h2 className="text-lg font-bold text-slate-900">GitHubでコードを公開・共有する手順</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    この「信用金庫 用品管理システム」のリポジトリをGitHubに作成し、誰でも閲覧・クローン・実行できるようにする方法です。
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>GitHubで新規リポジトリを作成</span>
                  </a>
                </div>
              </div>

              {/* クイックステップカード */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs mb-3">
                    1
                  </div>
                  <h3 className="font-bold text-xs text-slate-800 mb-1">GitHubでリポジトリ作成</h3>
                  <p className="text-xs text-slate-500">
                    GitHubにログインし、「New repository」で例えば <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">shinkin-supplies-system</code> という名前でPublicまたはPrivate作成します。
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs mb-3">
                    2
                  </div>
                  <h3 className="font-bold text-xs text-slate-800 mb-1">ファイルを配置</h3>
                  <p className="text-xs text-slate-500">
                    本プロジェクトの <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">app.py</code>、<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">README.md</code>、<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">requirements.txt</code> を手元にダウンロードしてフォルダにまとめます。
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
                  <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs mb-3">
                    3
                  </div>
                  <h3 className="font-bold text-xs text-slate-800 mb-1">Git pushで完了</h3>
                  <p className="text-xs text-slate-500">
                    ターミナルで <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">git push</code> するか、GitHubのWeb画面からドラッグ＆ドロップでアップロードすれば完了です。
                  </p>
                </div>
              </div>

              {/* ターミナルコマンド（ワンクリックコピー対応） */}
              <div className="bg-slate-900 text-slate-200 rounded-lg p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono text-xs font-semibold text-white">ターミナル操作用コマンド（コピペで即実行）</span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyCmd(
                        `# プロジェクトディレクトリを作成して移動
mkdir shinkin-supplies-system
cd shinkin-supplies-system

# Git初期化
git init
git branch -M main

# ファイルを追加
git add .
git commit -m "feat: 信用金庫向け用品管理システム (Streamlit/Python) 初期リリース"

# GitHubリモートURLを追加してpush（YOUR_USER_NAMEとREPO_NAMEはご自身のリポジトリに変更してください）
git remote add origin https://github.com/YOUR_USER_NAME/shinkin-supplies-system.git
git push -u origin main`,
                        'all_git'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-mono transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{gitCopied === 'all_git' ? 'コピー完了！' : '全コマンドをコピー'}</span>
                  </button>
                </div>

                <div className="font-mono text-xs space-y-3">
                  <div>
                    <span className="text-slate-400"># 1. ローカルディレクトリでGit初期化</span>
                    <div className="bg-slate-950 p-2.5 rounded mt-1 text-emerald-400 flex items-center justify-between">
                      <code>git init && git branch -M main</code>
                      <button
                        onClick={() => handleCopyCmd('git init && git branch -M main', 'c1')}
                        className="text-slate-400 hover:text-white"
                      >
                        {gitCopied === 'c1' ? '✓' : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400"># 2. ファイルをコミット</span>
                    <div className="bg-slate-950 p-2.5 rounded mt-1 text-emerald-400 flex items-center justify-between">
                      <code>git add . && git commit -m "feat: 信用金庫向け用品管理システム初期リリース"</code>
                      <button
                        onClick={() =>
                          handleCopyCmd('git add . && git commit -m "feat: 信用金庫向け用品管理システム初期リリース"', 'c2')
                        }
                        className="text-slate-400 hover:text-white"
                      >
                        {gitCopied === 'c2' ? '✓' : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400"># 3. GitHubリポジトリに接続してPush</span>
                    <div className="bg-slate-950 p-2.5 rounded mt-1 text-emerald-400 flex items-center justify-between">
                      <code>git remote add origin https://github.com/&lt;YOUR_ACCOUNT&gt;/&lt;REPO_NAME&gt;.git && git push -u origin main</code>
                      <button
                        onClick={() =>
                          handleCopyCmd(
                            'git remote add origin https://github.com/<YOUR_ACCOUNT>/<REPO_NAME>.git && git push -u origin main',
                            'c3'
                          )
                        }
                        className="text-slate-400 hover:text-white"
                      >
                        {gitCopied === 'c3' ? '✓' : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* GitHub用構成ファイル一覧とダウンロード */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-slate-700" />
                    <h3 className="text-sm font-bold text-slate-800">GitHubリポジトリに配置する構成ファイル一覧</h3>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href="/github-repo-files.zip"
                      download="SuppliesMA-source.zip"
                      className="flex items-center gap-1.5 px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded text-xs font-semibold shadow-xs transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>全ファイル一括ZIPダウンロード</span>
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-violet-50 rounded-md border border-violet-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-violet-950">💡 おすすめの最速アップロード手順:</span>
                    <p className="text-violet-800 text-[11px] mt-0.5">
                      上の「全ファイル一括ZIP」をダウンロードして展開（解凍）し、中身のファイルをすべてGitHubの「Upload files」画面にまとめてドラッグ＆ドロップするだけで完了します！
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-100 rounded text-xs">
                  <div className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-mono font-bold text-slate-900">.github/workflows/deploy.yml</div>
                      <div className="text-slate-500 text-[11px]">GitHub Pages自動デプロイ用ワークフロー（GitHub Actions設定）</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleCopyCmd(
                            `name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`,
                            'deploy_yml'
                          )
                        }
                        className="flex items-center gap-1 px-3 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded font-medium"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{gitCopied === 'deploy_yml' ? 'コピー完了！' : 'YAMLコピー'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-mono font-bold text-slate-900">app.py</div>
                      <div className="text-slate-500 text-[11px]">Streamlitアプリケーションの全機能を含む完全な1ファイルコード</div>
                    </div>
                    <a
                      href="/app.py"
                      download="app.py"
                      className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700"
                    >
                      <Download className="w-3 h-3" />
                      <span>ダウンロード</span>
                    </a>
                  </div>

                  <div className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-mono font-bold text-slate-900">README.md</div>
                      <div className="text-slate-500 text-[11px]">GitHubトップに表示される日本語説明・操作仕様・実行手順ドキュメント</div>
                    </div>
                    <a
                      href="/README.md"
                      download="README.md"
                      className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700"
                    >
                      <Download className="w-3 h-3" />
                      <span>ダウンロード</span>
                    </a>
                  </div>

                  <div className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="font-mono font-bold text-slate-900">requirements.txt</div>
                      <div className="text-slate-500 text-[11px]">pip install -r requirements.txt 用の依存パッケージ定義（streamlit, pandas）</div>
                    </div>
                    <a
                      href="/requirements.txt"
                      download="requirements.txt"
                      className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded font-medium text-slate-700"
                    >
                      <Download className="w-3 h-3" />
                      <span>ダウンロード</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* GitHub Pages設定ガイド（画面に完全対応） */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 text-xs text-emerald-950 space-y-4">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 border-b border-emerald-200 pb-2">
                  <span className="text-base">🌐</span>
                  <span>【解決】GitHub Settings &gt; Pages で何を選べばよいか？</span>
                </div>

                <div className="space-y-3">
                  <div className="bg-white p-3.5 rounded-md border border-emerald-200 space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px]">方法1（推奨・完全自動）</span>
                      <span>Source: 「GitHub Actions」を選び、ワークフローを置く</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      現在開いている画面の通り、<strong>Source</strong> を <strong>「GitHub Actions」</strong> のままにしておきます。<br />
                      リポジトリ内の <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">.github/workflows/deploy.yml</code> を追加してコミットすると、GitHubが自動でビルドし、<strong>数分で <code>https://snow454-dev.github.io/SuppliesMA/</code> にWebサイトとして世界中に公開</strong>されます！
                    </p>
                  </div>

                  <div className="bg-white p-3.5 rounded-md border border-emerald-200 space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-white text-[10px]">方法2（シンプル）</span>
                      <span>ビルド済みファイル（dist）を直接アップロードして即時公開</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      ビルド成果物である <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">index.html</code> と <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">assets</code> フォルダをそのままリポジトリのルートにアップロード。<br />
                      <strong>Source</strong> を <strong>「Deploy from a branch」</strong> に切り替え、<strong>Branch: <code>main</code> / <code>/(root)</code></strong> を選択して「Save」を押せば、ビルド待ち時間なしで即座に公開されます。
                    </p>
                  </div>
                </div>
              </div>

              {/* GitHub Web画面から直接アップロードする場合の案内 */}
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 text-xs text-sky-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-sky-950">
                  <span>💡 Gitコマンドを使わずにWebブラウザだけでGitHubに載せる場合:</span>
                </div>
                <p>
                  1. GitHubで新規リポジトリを作成後、画面内の「<strong>uploading an existing file</strong>」リンクをクリックします。<br />
                  2. 上のボタンでダウンロードした <strong>app.py</strong>, <strong>README.md</strong>, <strong>requirements.txt</strong> をブラウザにドラッグ＆ドロップします。<br />
                  3. 画面下の「Commit changes」緑色ボタンを押すだけで、GitHub上でリポジトリが完成し公開・共有できます。
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
