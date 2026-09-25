import streamlit as st
import pandas as pd
from datetime import datetime

# ==========================================
# 1. ページ基本設定 & 金融機関向けカスタムCSS
# ==========================================
st.set_page_config(
    page_title="信用金庫 用品管理システム",
    page_icon="🏦",
    layout="wide",
    initial_sidebar_state="expanded",
)

# 金融機関業務システム向けの高品位スタイリング
st.markdown("""
<style>
    /* 全体フォント・ベース */
    .stApp {
        background-color: #f8fafc;
        font-family: 'Noto Sans JP', 'Segoe UI', sans-serif;
    }
    
    /* ヘッダー・バナー */
    .bank-header {
        background: linear-gradient(135deg, #0f2b48 0%, #1e3a5f 100%);
        color: #ffffff;
        padding: 1.2rem 1.8rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .bank-title {
        font-size: 1.45rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        margin: 0;
    }
    .bank-subtitle {
        font-size: 0.85rem;
        color: #94a3b8;
        margin-top: 4px;
    }
    
    /* カード・枠組み */
    .system-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 1.25rem;
        margin-bottom: 1.2rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    
    /* カタログプレビュー用ボックス */
    .catalog-item-box {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 1rem;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .catalog-img-placeholder {
        background-color: #f1f5f9;
        border: 1px dashed #94a3b8;
        height: 110px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #475569;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
    }
    
    /* ステータスバッジ調テキスト */
    .badge-wait {
        color: #d97706;
        font-weight: 600;
        background-color: #fef3c7;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
    }
    .badge-approved {
        color: #059669;
        font-weight: 600;
        background-color: #d1fae5;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
    }
    .badge-rejected {
        color: #dc2626;
        font-weight: 600;
        background-color: #fee2e2;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
    }
    .badge-strict {
        color: #7c2d12;
        font-weight: 600;
        background-color: #ffedd5;
        border: 1px solid #fed7aa;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
    }
    
    /* テーブルヘッダ・フォント調整 */
    .stDataFrame {
        background-color: #ffffff;
        border-radius: 6px;
    }
</style>
""", unsafe_allow_html=True)


# ==========================================
# 2. 初期データ生成 & セッションステート初期化
# ==========================================
def init_session_state():
    # ユーザー情報マスタ
    if "users" not in st.session_state:
        st.session_state.users = [
            {"id": "U001", "name": "新橋支店 窓口担当（鈴木）", "role": "営業店", "branch": "新橋支店"},
            {"id": "U002", "name": "新宿支店 業務担当（高橋）", "role": "営業店", "branch": "新宿支店"},
            {"id": "U003", "name": "本店営業部 役席（佐藤）", "role": "営業店", "branch": "本店営業部"},
            {"id": "U004", "name": "本部 事務統括部（山田課長）", "role": "本部", "branch": "本部 事務統括部"},
        ]
    
    # ログイン中ユーザー選択（初期値: 新橋支店）
    if "current_user_idx" not in st.session_state:
        st.session_state.current_user_idx = 0
        
    # 用品マスタ（ID, 品名, カテゴリ[一般/厳格], 単価, 現在在庫, 安全在庫, 単位, 説明）
    if "items" not in st.session_state:
        st.session_state.items = [
            # 一般消耗品
            {"id": "G001", "name": "コピー用紙 A4（500枚×5冊箱）", "category": "一般消耗品", "price": 2400, "stock": 45, "safe_stock": 20, "unit": "箱", "icon": "📄"},
            {"id": "G002", "name": "窓口用油性ボールペン黒（10本入）", "category": "一般消耗品", "price": 950, "stock": 80, "safe_stock": 30, "unit": "箱", "icon": "🖊️"},
            {"id": "G003", "name": "金庫名入 現金封筒 大（500枚入）", "category": "一般消耗品", "price": 3200, "stock": 18, "safe_stock": 25, "unit": "包", "icon": "✉️"},
            {"id": "G004", "name": "金庫名入 現金封筒 小（500枚入）", "category": "一般消耗品", "price": 2800, "stock": 35, "safe_stock": 25, "unit": "包", "icon": "✉️"},
            {"id": "G005", "name": "窓口勘定科目用スタンプ台（藍）", "category": "一般消耗品", "price": 780, "stock": 12, "safe_stock": 15, "unit": "個", "icon": "⬛"},
            {"id": "G006", "name": "窓口用付箋紙セット（5色パック）", "category": "一般消耗品", "price": 620, "stock": 90, "safe_stock": 40, "unit": "組", "icon": "📑"},
            # 厳格管理品（通帳・証書・手形等）
            {"id": "S001", "name": "総合口座通帳（磁気テープ付 100冊）", "category": "厳格管理品", "price": 8500, "stock": 60, "safe_stock": 40, "unit": "組(100冊)", "icon": "📘"},
            {"id": "S002", "name": "普通預金通帳（ICチップ搭載 100冊）", "category": "厳格管理品", "price": 9800, "stock": 25, "safe_stock": 30, "unit": "組(100冊)", "icon": "📗"},
            {"id": "S003", "name": "定期預金通帳（100冊）", "category": "厳格管理品", "price": 7600, "stock": 38, "safe_stock": 20, "unit": "組(100冊)", "icon": "📙"},
            {"id": "S004", "name": "当座手形用紙（50枚綴×5冊組）", "category": "厳格管理品", "price": 12000, "stock": 15, "safe_stock": 20, "unit": "組", "icon": "📋"},
            {"id": "S005", "name": "為替小切手用紙（50枚綴×5冊組）", "category": "厳格管理品", "price": 11500, "stock": 22, "safe_stock": 15, "unit": "組", "icon": "📋"},
        ]
        
    # 店舗別月間用品予算
    if "budgets" not in st.session_state:
        st.session_state.budgets = {
            "新橋支店": {"budget": 150000, "used": 98500},
            "新宿支店": {"budget": 180000, "used": 142000},
            "本店営業部": {"budget": 300000, "used": 215000},
            "渋谷支店": {"budget": 160000, "used": 110000},
        }

    # 発注履歴
    if "orders" not in st.session_state:
        st.session_state.orders = [
            {
                "order_id": "ORD-2026-001",
                "branch": "新橋支店",
                "item_id": "G001",
                "item_name": "コピー用紙 A4（500枚×5冊箱）",
                "category": "一般消耗品",
                "quantity": 3,
                "unit_price": 2400,
                "total_price": 7200,
                "status": "承認済（出荷手配）",
                "serial_range": "-",
                "applicant": "新橋支店 窓口担当（鈴木）",
                "date": "2026-09-18 10:15",
                "approved_date": "2026-09-18 13:40",
            },
            {
                "order_id": "ORD-2026-002",
                "branch": "新橋支店",
                "item_id": "S001",
                "item_name": "総合口座通帳（磁気テープ付 100冊）",
                "category": "厳格管理品",
                "quantity": 2,
                "unit_price": 8500,
                "total_price": 17000,
                "status": "承認済（出荷手配）",
                "serial_range": "TK-2026-0101 〜 TK-2026-0300",
                "applicant": "新橋支店 窓口担当（鈴木）",
                "date": "2026-09-20 14:30",
                "approved_date": "2026-09-21 09:15",
            },
            {
                "order_id": "ORD-2026-003",
                "branch": "新宿支店",
                "item_id": "G003",
                "item_name": "金庫名入 現金封筒 大（500枚入）",
                "category": "一般消耗品",
                "quantity": 2,
                "unit_price": 3200,
                "total_price": 6400,
                "status": "承認待ち",
                "serial_range": "-",
                "applicant": "新宿支店 業務担当（高橋）",
                "date": "2026-09-24 16:00",
                "approved_date": "-",
            },
            {
                "order_id": "ORD-2026-004",
                "branch": "新橋支店",
                "item_id": "S002",
                "item_name": "普通預金通帳（ICチップ搭載 100冊）",
                "category": "厳格管理品",
                "quantity": 1,
                "unit_price": 9800,
                "total_price": 9800,
                "status": "承認待ち",
                "serial_range": "-",
                "applicant": "新橋支店 窓口担当（鈴木）",
                "date": "2026-09-25 09:20",
                "approved_date": "-",
            },
            {
                "order_id": "ORD-2026-005",
                "branch": "本店営業部",
                "item_id": "S004",
                "item_name": "当座手形用紙（50枚綴×5冊組）",
                "category": "厳格管理品",
                "quantity": 1,
                "unit_price": 12000,
                "total_price": 12000,
                "status": "承認待ち",
                "serial_range": "-",
                "applicant": "本店営業部 役席（佐藤）",
                "date": "2026-09-25 10:05",
                "approved_date": "-",
            },
        ]

    # 厳格管理台帳（通帳・重要用紙の店舗払出追跡記録）
    if "strict_ledger" not in st.session_state:
        st.session_state.strict_ledger = [
            {
                "ledger_id": "LED-2026-081",
                "order_id": "ORD-2026-002",
                "date": "2026-09-21",
                "branch": "新橋支店",
                "item_id": "S001",
                "item_name": "総合口座通帳（磁気テープ付 100冊）",
                "quantity": 2,
                "serial_start": "TK-2026-0101",
                "serial_end": "TK-2026-0300",
                "authorizer": "本部 事務統括部（山田課長）",
                "status": "営業店受領済",
            },
            {
                "ledger_id": "LED-2026-075",
                "order_id": "ORD-2026-PREV",
                "date": "2026-09-10",
                "branch": "新宿支店",
                "item_id": "S002",
                "item_name": "普通預金通帳（ICチップ搭載 100冊）",
                "quantity": 1,
                "serial_start": "IC-2026-0001",
                "serial_end": "IC-2026-0100",
                "authorizer": "本部 事務統括部（山田課長）",
                "status": "営業店受領済",
            },
            {
                "ledger_id": "LED-2026-068",
                "order_id": "ORD-2026-PREV2",
                "date": "2026-09-05",
                "branch": "本店営業部",
                "item_id": "S004",
                "item_name": "当座手形用紙（50枚綴×5冊組）",
                "quantity": 2,
                "serial_start": "TE-2026-5001",
                "serial_end": "TE-2026-5500",
                "authorizer": "本部 事務統括部（山田課長）",
                "status": "営業店受領済",
            },
        ]

init_session_state()


# ==========================================
# 3. サイドバー：認証・店舗切り替え & 画面遷移
# ==========================================
with st.sidebar:
    st.markdown("### 🏦 **信金業務ポータル**")
    st.caption("用品発注・厳格管理台帳システム v2.4")
    st.divider()

    # ログインユーザー切り替え（営業店 vs 本部）
    user_options = [f"{u['name']} 【{u['role']}】" for u in st.session_state.users]
    selected_user_str = st.selectbox(
        "👤 ログインユーザー切替",
        options=user_options,
        index=st.session_state.current_user_idx,
    )
    # インデックス逆算
    st.session_state.current_user_idx = user_options.index(selected_user_str)
    current_user = st.session_state.users[st.session_state.current_user_idx]

    # 現在の権限表示
    if current_user["role"] == "本部":
        st.info(f"🔑 **権限**: 本部管理者\n\n所属: {current_user['branch']}")
    else:
        st.success(f"🏢 **権限**: 営業店ユーザー\n\n所属: {current_user['branch']}")

    st.divider()

    # 画面遷移ラジオボタン
    menu = st.radio(
        "📌 業務メニュー選択",
        [
            "① ダッシュボード",
            "② 用品発注画面（営業店向け）",
            "③ 承認・出荷管理画面（本部向け）",
            "④ 在庫・厳格管理台帳（本部向け）",
        ],
        index=0,
    )

    st.divider()
    # 本部未承認アラートバッジ
    pending_count = len([o for o in st.session_state.orders if o["status"] == "承認待ち"])
    if pending_count > 0:
        st.warning(f"⚠️ 承認待ち申請: **{pending_count} 件**")
    else:
        st.caption("✅ 承認待ちの申請はありません")

    # 安全在庫割れアラート
    shortage_count = len([i for i in st.session_state.items if i["stock"] <= i["safe_stock"]])
    if shortage_count > 0:
        st.error(f"🚨 在庫不足アラート: **{shortage_count} 品目**")


# ==========================================
# 4. ヘッダー表示
# ==========================================
st.markdown(f"""
<div class="bank-header">
    <div>
        <div class="bank-title">信用金庫 用品受発注・厳格管理台帳システム</div>
        <div class="bank-subtitle">西都信用金庫 事務統括部・営業店間 オンライン用品管理プラットフォーム</div>
    </div>
    <div style="text-align: right;">
        <span style="font-size: 0.9rem; font-weight: 600;">{current_user['branch']}</span><br>
        <span style="font-size: 0.8rem; color: #cbd5e1;">操作者: {current_user['name']}</span>
    </div>
</div>
""", unsafe_allow_html=True)


# ==========================================
# 画面①：ダッシュボード
# ==========================================
if menu == "① ダッシュボード":
    st.subheader("📊 ダッシュボード")
    
    if current_user["role"] == "営業店":
        # ------------------------------------
        # 営業店ユーザー向けビュー
        # ------------------------------------
        branch_name = current_user["branch"]
        branch_budget_info = st.session_state.budgets.get(branch_name, {"budget": 150000, "used": 50000})
        budget_total = branch_budget_info["budget"]
        budget_used = branch_budget_info["used"]
        budget_rate = min(1.0, budget_used / budget_total) if budget_total > 0 else 0.0

        st.markdown(f"#### 🏢 {branch_name} 用品執行状況")
        
        # 予算消化メトリクス
        m1, m2, m3, m4 = st.columns(4)
        with m1:
            st.metric("今月用品予算", f"¥{budget_total:,}")
        with m2:
            st.metric("当月消化額（確定+手配）", f"¥{budget_used:,}")
        with m3:
            remaining = budget_total - budget_used
            st.metric("今月残予算", f"¥{remaining:,}", delta=f"{int((1 - budget_rate)*100)}% 残")
        with m4:
            st.metric("今月の予算消化率", f"{budget_rate * 100:.1f} %")

        # 予算プログレスバー
        st.write("**当月予算消化プログレス**")
        progress_color_desc = "正常枠内" if budget_rate < 0.8 else ("予算超過注意" if budget_rate < 1.0 else "予算上限到達")
        st.progress(budget_rate)
        st.caption(f"現在の予算枠進捗: {budget_rate * 100:.1f}% （判定: {progress_color_desc}）")

        st.markdown("---")

        # 自店舗の申請ステータス一覧
        st.markdown("#### 📋 自店舗の発注申請ステータス一覧")
        my_orders = [o for o in st.session_state.orders if o["branch"] == branch_name]
        
        c_wait = len([o for o in my_orders if o["status"] == "承認待ち"])
        c_appr = len([o for o in my_orders if o["status"] == "承認済（出荷手配）"])
        c_rej = len([o for o in my_orders if o["status"] == "却下"])
        
        col_s1, col_s2, col_s3 = st.columns(3)
        col_s1.metric("承認待ち（審査中）", f"{c_wait} 件")
        col_s2.metric("承認済（出荷・配給中）", f"{c_appr} 件")
        col_s3.metric("却下・差戻し", f"{c_rej} 件")

        if my_orders:
            df_my = pd.DataFrame(my_orders)
            df_my_display = df_my[[
                "order_id", "date", "item_name", "category", "quantity", 
                "total_price", "status", "serial_range"
            ]].copy()
            df_my_display.columns = [
                "発注ID", "申請日時", "品名", "種別", "数量", "合計金額(円)", "ステータス", "割当シリアル番号"
            ]
            # 金額書式設定
            df_my_display["合計金額(円)"] = df_my_display["合計金額(円)"].apply(lambda x: f"¥{x:,}")
            st.dataframe(df_my_display, use_container_width=True, hide_index=True)
        else:
            st.info("現在、発注履歴はありません。サイドバーから「② 用品発注画面」を開いて発注を行ってください。")

    else:
        # ------------------------------------
        # 本部ユーザー向けビュー
        # ------------------------------------
        st.markdown("#### 🏛️ 本部 事務統括部 全店統括サマリー")
        
        # 本部サマリーメトリクス
        pending_orders = [o for o in st.session_state.orders if o["status"] == "承認待ち"]
        shortage_items = [i for i in st.session_state.items if i["stock"] <= i["safe_stock"]]
        total_monthly_orders = sum(o["total_price"] for o in st.session_state.orders if o["status"] != "却下")
        
        col_h1, col_h2, col_h3, col_h4 = st.columns(4)
        with col_h1:
            st.metric("要承認 申請件数", f"{len(pending_orders)} 件", delta=f"{len(pending_orders)} 件 未処理", delta_color="inverse")
        with col_h2:
            st.metric("在庫不足（割れ）品目", f"{len(shortage_items)} 品目", delta="要補充手配", delta_color="inverse")
        with col_h3:
            st.metric("全店月間発注累計", f"¥{total_monthly_orders:,}")
        with col_h4:
            st.metric("厳格管理品 登録数", f"{len(st.session_state.strict_ledger)} 件")

        # 在庫不足アラートカード表示
        if shortage_items:
            st.markdown("##### 🚨 在庫不足（安全在庫割れ）アラート品目")
            df_shortage = pd.DataFrame(shortage_items)[["id", "name", "category", "stock", "safe_stock", "unit", "price"]]
            df_shortage.columns = ["品目ID", "品名", "カテゴリ", "現在庫数", "安全在庫数", "単位", "単価(円)"]
            df_shortage["状態"] = "⚠️ 在庫不足"
            df_shortage["単価(円)"] = df_shortage["単価(円)"].apply(lambda x: f"¥{x:,}")
            st.dataframe(df_shortage, use_container_width=True, hide_index=True)
            st.caption("※「④ 在庫・厳格管理台帳」画面から緊急入庫・在庫補充処理が可能です。")

        st.markdown("---")
        
        # 全店の予算消化状況テーブル＆グラフ
        st.markdown("##### 🏢 全営業店の当月予算消化状況")
        budget_records = []
        for branch, bdata in st.session_state.budgets.items():
            rate = round((bdata["used"] / bdata["budget"]) * 100, 1)
            budget_records.append({
                "営業店名": branch,
                "月間予算額": f"¥{bdata['budget']:,}",
                "当月消化額": f"¥{bdata['used']:,}",
                "残予算額": f"¥{bdata['budget'] - bdata['used']:,}",
                "消化率(%)": rate,
                "進捗判定": "順調" if rate < 80 else ("要モニタリング" if rate < 95 else "予算枠逼迫"),
            })
        
        df_budgets = pd.DataFrame(budget_records)
        c_b1, c_b2 = st.columns([3, 2])
        with c_b1:
            st.dataframe(df_budgets, use_container_width=True, hide_index=True)
        with c_b2:
            st.write("**店舗別 予算消化率比較 (%)**")
            chart_df = pd.DataFrame({
                "営業店": [r["営業店名"] for r in budget_records],
                "消化率(%)": [r["消化率(%)"] for r in budget_records]
            }).set_index("営業店")
            st.bar_chart(chart_df)


# ==========================================
# 画面②：用品発注画面（営業店向け）
# ==========================================
elif menu == "② 用品発注画面（営業店向け）":
    st.subheader("🛒 用品発注申請（営業店向け）")
    st.info(f"発注元営業店: **{current_user['branch']}** ｜ 申請者: **{current_user['name']}**")

    # タブで「一般消耗品」と「厳格管理品」を分割
    tab_general, tab_strict = st.tabs(["📄 一般消耗品カタログ", "🔒 厳格管理品カタログ（通帳・重要用紙）"])

    # 1. 一般消耗品タブ
    with tab_general:
        st.markdown("##### 事務用品・伝票・消耗品")
        st.caption("日常の窓口・融資・後方事務で使用する一般消耗品です。")

        general_items = [i for i in st.session_state.items if i["category"] == "一般消耗品"]
        
        # 3カラムのグリッドでカタログ表示
        cols = st.columns(3)
        for idx, item in enumerate(general_items):
            with cols[idx % 3]:
                st.markdown(f"""
                <div class="catalog-item-box">
                    <div>
                        <div class="catalog-img-placeholder">
                            <span style="font-size: 2.2rem; margin-right: 8px;">{item['icon']}</span>
                            <span>[{item['id']}] {item['unit']}</span>
                        </div>
                        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; color: #1e293b;">
                            {item['name']}
                        </div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 8px;">
                            単価: <strong style="color: #0f172a; font-size: 1.05rem;">¥{item['price']:,}</strong> / {item['unit']}
                        </div>
                        <div style="font-size: 0.8rem; color: {'#059669' if item['stock'] > item['safe_stock'] else '#dc2626'}; margin-bottom: 10px;">
                            本部在庫: {item['stock']} {item['unit']}
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                # 発注フォーム
                with st.form(key=f"order_form_gen_{item['id']}"):
                    qty = st.number_input("発注数", min_value=1, max_value=20, value=1, step=1, key=f"qty_{item['id']}")
                    calc_total = qty * item["price"]
                    st.caption(f"合計金額: ¥{calc_total:,}")
                    submit_btn = st.form_submit_button(f"発注申請する (¥{calc_total:,})", use_container_width=True)
                    
                    if submit_btn:
                        # 新規発注データ作成
                        new_order_id = f"ORD-2026-{len(st.session_state.orders) + 1:03d}"
                        now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
                        new_order = {
                            "order_id": new_order_id,
                            "branch": current_user["branch"],
                            "item_id": item["id"],
                            "item_name": item["name"],
                            "category": item["category"],
                            "quantity": qty,
                            "unit_price": item["price"],
                            "total_price": calc_total,
                            "status": "承認待ち",
                            "serial_range": "-",
                            "applicant": current_user["name"],
                            "date": now_str,
                            "approved_date": "-",
                        }
                        st.session_state.orders.insert(0, new_order)
                        
                        # 予算使用額の仮加算（営業店）
                        if current_user["branch"] in st.session_state.budgets:
                            st.session_state.budgets[current_user["branch"]]["used"] += calc_total

                        st.success(f"発注申請を受け付けました！ 発注ID: {new_order_id}（本部承認待ち）")
                        st.rerun()

    # 2. 厳格管理品タブ
    with tab_strict:
        st.markdown("##### 🔒 厳格管理品（通帳・証書・手形・小切手）")
        st.warning("⚠️ **厳格管理品の取扱注意**: 厳格管理品の発注は本部役席による番号割当・厳封出荷の手続きを経ます。受領後は営業店金庫責任者による検数およびシリアル番号確認が必須です。")

        strict_items = [i for i in st.session_state.items if i["category"] == "厳格管理品"]
        
        s_cols = st.columns(2)
        for idx, item in enumerate(strict_items):
            with s_cols[idx % 2]:
                st.markdown(f"""
                <div class="catalog-item-box" style="border-top: 3px solid #b45309;">
                    <div>
                        <div class="catalog-img-placeholder" style="background-color: #fefce8; border-color: #eab308;">
                            <span style="font-size: 2.2rem; margin-right: 8px;">{item['icon']}</span>
                            <span style="color: #854d0e;">🔒 厳格管理品 [{item['id']}]</span>
                        </div>
                        <div style="font-weight: 700; font-size: 1rem; margin-bottom: 4px; color: #1e293b;">
                            {item['name']}
                        </div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 8px;">
                            単価: <strong style="color: #0f172a; font-size: 1.05rem;">¥{item['price']:,}</strong> / {item['unit']}
                        </div>
                        <div style="font-size: 0.8rem; color: {'#059669' if item['stock'] > item['safe_stock'] else '#dc2626'}; margin-bottom: 10px;">
                            本部金庫残高: {item['stock']} {item['unit']} （安全在庫: {item['safe_stock']}）
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
                
                with st.form(key=f"order_form_strict_{item['id']}"):
                    qty = st.number_input("発注組数", min_value=1, max_value=5, value=1, step=1, key=f"sqty_{item['id']}")
                    calc_total = qty * item["price"]
                    st.caption(f"請求合計: ¥{calc_total:,}（承認後にシリアル番号が付与されます）")
                    submit_strict_btn = st.form_submit_button(f"🔒 厳格品発注を申請する (¥{calc_total:,})", use_container_width=True)
                    
                    if submit_strict_btn:
                        new_order_id = f"ORD-2026-{len(st.session_state.orders) + 1:03d}"
                        now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
                        new_order = {
                            "order_id": new_order_id,
                            "branch": current_user["branch"],
                            "item_id": item["id"],
                            "item_name": item["name"],
                            "category": item["category"],
                            "quantity": qty,
                            "unit_price": item["price"],
                            "total_price": calc_total,
                            "status": "承認待ち",
                            "serial_range": "（承認時割当）",
                            "applicant": current_user["name"],
                            "date": now_str,
                            "approved_date": "-",
                        }
                        st.session_state.orders.insert(0, new_order)
                        
                        if current_user["branch"] in st.session_state.budgets:
                            st.session_state.budgets[current_user["branch"]]["used"] += calc_total

                        st.success(f"厳格管理品の発注申請を行いました！ 発注ID: {new_order_id}（本部承認待ち）")
                        st.rerun()


# ==========================================
# 画面③：承認・出荷管理画面（本部向け）
# ==========================================
elif menu == "③ 承認・出荷管理画面（本部向け）":
    st.subheader("📑 営業店発注の承認・出荷手配管理（本部向け）")
    
    # 権限チェック（営業店で閲覧している場合の配慮）
    if current_user["role"] != "本部":
        st.warning("⚠️ 現在「営業店ユーザー」としてログイン中です。承認操作をテストする場合は、左サイドバー上部のユーザー切替で「本部 事務統括部（山田課長）」を選択してください。")

    # 承認待ち申請の抽出
    pending_list = [o for o in st.session_state.orders if o["status"] == "承認待ち"]

    st.markdown(f"#### ⏳ 承認待ち申請一覧 （現在: **{len(pending_list)} 件**）")

    if not pending_list:
        st.success("🎉 現在、未処理の承認待ち申請はありません。全店の発注は処理完了しています。")
    else:
        # 表形式で一覧表示
        df_pending = pd.DataFrame(pending_list)[[
            "order_id", "date", "branch", "item_name", "category", 
            "quantity", "total_price", "applicant"
        ]].copy()
        df_pending.columns = [
            "発注ID", "申請日時", "申請店舗", "品名", "種別", "数量", "合計金額(円)", "申請担当者"
        ]
        df_pending["合計金額(円)"] = df_pending["合計金額(円)"].apply(lambda x: f"¥{x:,}")
        st.dataframe(df_pending, use_container_width=True, hide_index=True)

        st.markdown("---")
        st.markdown("#### ✍️ 申請の個別審査・出荷手配処理")

        # 審査対象の発注選択
        order_options = [
            f"{o['order_id']} | {o['branch']} | {o['item_name']} ({o['quantity']}個) ¥{o['total_price']:,} [{o['category']}]"
            for o in pending_list
        ]
        selected_order_label = st.selectbox("審査対象の申請を選択してください", options=order_options)
        
        # 選択された発注オブジェクト取得
        selected_order_id = selected_order_label.split(" | ")[0]
        target_order = next((o for o in pending_list if o["order_id"] == selected_order_id), None)

        if target_order:
            with st.container():
                st.markdown(f"""
                <div class="system-card" style="border-left: 4px solid #1e3a5f;">
                    <div style="font-size: 1.1rem; font-weight: 700; color: #0f2b48;">
                        発注詳細: {target_order['order_id']} （{target_order['branch']} 申請）
                    </div>
                    <div style="margin-top: 8px; font-size: 0.9rem; line-height: 1.8;">
                        ・品目名: <strong>{target_order['item_name']}</strong> （{target_order['category']}）<br>
                        ・発注数量: <strong>{target_order['quantity']}</strong> ｜ 合計金額: <strong>¥{target_order['total_price']:,}</strong><br>
                        ・申請日時: {target_order['date']} ｜ 申請者: {target_order['applicant']}
                    </div>
                </div>
                """, unsafe_allow_html=True)

                is_strict = (target_order["category"] == "厳格管理品")

                if is_strict:
                    # 厳格管理品の場合：シリアルナンバー入力機能
                    st.markdown("##### 🔒 厳格管理品 出荷シリアルナンバー割当")
                    st.caption("本部重要物保管金庫より払出す現物の番号帯（通帳冊番号・手形記号番号）を入力してください。")
                    
                    # 自動サジェスト用シリアル例の計算
                    prefix = "TK-2026-" if "総合口座" in target_order["item_name"] else ("IC-2026-" if "IC" in target_order["item_name"] else "TE-2026-")
                    suggested_start = f"{prefix}0301"
                    suggested_end = f"{prefix}{300 + (target_order['quantity'] * 100):04d}"
                    default_serial_val = f"{suggested_start} 〜 {suggested_end}"

                    col_ser1, col_ser2 = st.columns([2, 1])
                    with col_ser1:
                        serial_input = st.text_input(
                            "割当シリアルナンバー帯（必須）",
                            value=default_serial_val,
                            help="通帳の通し番号などを入力します。例: TK-2026-0301 〜 TK-2026-0500",
                        )
                    with col_ser2:
                        st.text_input("本部金庫出納検印者", value=current_user["name"], disabled=True)
                else:
                    serial_input = "-"

                # 承認・却下の操作ボタン
                btn_col1, btn_col2, btn_col3 = st.columns([2, 2, 4])
                
                with btn_col1:
                    approve_label = "✅ 承認・出荷手配（シリアル割当）" if is_strict else "✅ 承認（出荷手配）"
                    if st.button(approve_label, type="primary", use_container_width=True):
                        now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
                        
                        # 1. 注文ステータス更新
                        target_order["status"] = "承認済（出荷手配）"
                        target_order["serial_range"] = serial_input
                        target_order["approved_date"] = now_str
                        
                        # 2. 用品マスタの在庫削減
                        item_obj = next((i for i in st.session_state.items if i["id"] == target_order["item_id"]), None)
                        if item_obj:
                            item_obj["stock"] = max(0, item_obj["stock"] - target_order["quantity"])
                        
                        # 3. 厳格管理品の場合、厳格管理台帳へ追記
                        if is_strict:
                            new_ledger_entry = {
                                "ledger_id": f"LED-2026-{len(st.session_state.strict_ledger) + 1:03d}",
                                "order_id": target_order["order_id"],
                                "date": datetime.now().strftime("%Y-%m-%d"),
                                "branch": target_order["branch"],
                                "item_id": target_order["item_id"],
                                "item_name": target_order["item_name"],
                                "quantity": target_order["quantity"],
                                "serial_start": serial_input.split(" 〜 ")[0] if " 〜 " in serial_input else serial_input,
                                "serial_end": serial_input.split(" 〜 ")[1] if " 〜 " in serial_input else serial_input,
                                "authorizer": current_user["name"],
                                "status": "本部払出済（配送便）",
                            }
                            st.session_state.strict_ledger.insert(0, new_ledger_entry)

                        st.success(f"申請 {target_order['order_id']} を承認し出荷登録を完了しました！")
                        st.rerun()

                with btn_col2:
                    if st.button("❌ 却下（差戻し）", use_container_width=True):
                        target_order["status"] = "却下"
                        target_order["approved_date"] = datetime.now().strftime("%Y-%m-%d %H:%M")
                        
                        # 予算使用額の返還処理
                        if target_order["branch"] in st.session_state.budgets:
                            st.session_state.budgets[target_order["branch"]]["used"] = max(
                                0, st.session_state.budgets[target_order["branch"]]["used"] - target_order["total_price"]
                            )

                        st.warning(f"申請 {target_order['order_id']} を却下しました。")
                        st.rerun()

    # 承認履歴テーブル
    st.markdown("---")
    st.markdown("#### 📜 直近の全店処理済み履歴（承認済 / 却下）")
    processed_orders = [o for o in st.session_state.orders if o["status"] != "承認待ち"]
    if processed_orders:
        df_proc = pd.DataFrame(processed_orders)[[
            "order_id", "approved_date", "branch", "item_name", "category", 
            "quantity", "total_price", "status", "serial_range"
        ]].copy()
        df_proc.columns = ["発注ID", "処理日時", "店舗名", "品名", "種別", "数量", "金額(円)", "ステータス", "割当シリアル"]
        df_proc["金額(円)"] = df_proc["金額(円)"].apply(lambda x: f"¥{x:,}")
        st.dataframe(df_proc, use_container_width=True, hide_index=True)


# ==========================================
# 画面④：在庫・厳格管理台帳（本部向け）
# ==========================================
elif menu == "④ 在庫・厳格管理台帳（本部向け）":
    st.subheader("📦 在庫マスタ ＆ 厳格管理品受払台帳")

    tab_stock, tab_ledger = st.tabs(["📦 本部全用品 在庫管理一覧", "📑 厳格管理品（通帳等）払出台帳"])

    # 1. 在庫一覧タブ
    with tab_stock:
        st.markdown("##### 🏛️ 本部センター在庫状況一覧")
        
        # 簡易在庫補充フォーム
        with st.expander("➕ 本部在庫の入庫・補充登録（仕入受入）"):
            with st.form("replenish_form"):
                rep_item_names = [f"[{i['id']}] {i['name']} (現在庫: {i['stock']})" for i in st.session_state.items]
                rep_selected_str = st.selectbox("入庫する用品を選択", rep_item_names)
                rep_qty = st.number_input("入庫数量", min_value=1, max_value=500, value=50, step=5)
                rep_submit = st.form_submit_button("入庫を確定する")
                
                if rep_submit:
                    target_rep_id = rep_selected_str.split("]")[0].replace("[", "")
                    for it in st.session_state.items:
                        if it["id"] == target_rep_id:
                            it["stock"] += rep_qty
                            st.success(f"{it['name']} を {rep_qty} {it['unit']} 入庫しました。（新在庫: {it['stock']}）")
                            break
                    st.rerun()

        # 在庫一覧データフレーム
        df_items = pd.DataFrame(st.session_state.items)
        df_items_disp = df_items[["id", "name", "category", "price", "stock", "safe_stock", "unit"]].copy()
        df_items_disp["在庫金額(円)"] = df_items_disp["price"] * df_items_disp["stock"]
        df_items_disp["在庫アラート"] = df_items_disp.apply(
            lambda r: "🚨 不足（発注要）" if r["stock"] <= r["safe_stock"] else "✅ 適正", axis=1
        )
        
        df_items_disp.columns = [
            "用品ID", "品目名", "区分", "単価(円)", "現在庫数", "安全在庫数", "単位", "在庫総評価額(円)", "在庫判定"
        ]
        df_items_disp["単価(円)"] = df_items_disp["単価(円)"].apply(lambda x: f"¥{x:,}")
        df_items_disp["在庫総評価額(円)"] = df_items_disp["在庫総評価額(円)"].apply(lambda x: f"¥{x:,}")
        
        st.dataframe(df_items_disp, use_container_width=True, hide_index=True)

    # 2. 厳格管理台帳タブ
    with tab_ledger:
        st.markdown("##### 🔒 厳格管理品（通帳・手形用紙等）営業店払出履歴台帳")
        st.caption("金融機関の内部統制および検査対応用として、厳格管理品のシリアル番号帯、払出先店舗、承認責任者を厳密に記録・追跡します。")

        # フィルタ機能
        f_col1, f_col2 = st.columns(2)
        branches = ["全店舗"] + sorted(list(set([l["branch"] for l in st.session_state.strict_ledger])))
        with f_col1:
            sel_branch = st.selectbox("営業店で絞り込み", branches)
        with f_col2:
            items_list = ["全品目"] + sorted(list(set([l["item_name"] for l in st.session_state.strict_ledger])))
            sel_item = st.selectbox("品目で絞り込み", items_list)

        # フィルタ適用
        filtered_ledger = st.session_state.strict_ledger
        if sel_branch != "全店舗":
            filtered_ledger = [l for l in filtered_ledger if l["branch"] == sel_branch]
        if sel_item != "全品目":
            filtered_ledger = [l for l in filtered_ledger if l["item_name"] == sel_item]

        if filtered_ledger:
            df_ledger = pd.DataFrame(filtered_ledger)[[
                "ledger_id", "date", "branch", "item_name", "quantity", 
                "serial_start", "serial_end", "authorizer", "status"
            ]].copy()
            df_ledger.columns = [
                "台帳ID", "払出年月日", "払出先営業店", "厳格管理品名", "数量", 
                "開始シリアル番号", "終了シリアル番号", "本部承認者", "現物ステータス"
            ]
            st.dataframe(df_ledger, use_container_width=True, hide_index=True)

            # CSVダウンロード機能（監査・検査用）
            csv_data = df_ledger.to_csv(index=False).encode('utf-8-sig')
            st.download_button(
                label="📥 厳格管理台帳をCSVエクスポート（内部監査・検査対応用）",
                data=csv_data,
                file_name=f"shinkin_strict_ledger_{datetime.now().strftime('%Y%m%d')}.csv",
                mime="text/csv",
            )
        else:
            st.info("該当する厳格管理品の払出履歴はありません。")


# ==========================================
# 5. フッター
# ==========================================
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: #94a3b8; font-size: 0.8rem; padding: 1rem 0;">
    西都信用金庫 事務統括部 用品集中管理システム ｜ 厳格管理品取扱規則 第14条・第22条準拠
</div>
""", unsafe_allow_html=True)
