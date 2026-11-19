import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Target,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Edit2,
  Save,
  RotateCcw,
  PieChart,
  BarChart3,
  DollarSign,
  Users,
  Store,
  Layers,
} from 'lucide-react';
import { MARKET_SIZING } from '../../data/mockData';
import { UnitEconomicsScenario, ValidationMilestone, CoreAssumption } from '../../types';

export const FounderWorkspace: React.FC = () => {
  const {
    scenarios,
    activeScenarioId,
    setActiveScenarioId,
    updateScenario,
    validationMilestones,
    updateValidationMilestone,
    coreAssumptions,
    updateCoreAssumption,
    purchaseRequests,
    stores,
  } = useApp();

  const [workspaceTab, setWorkspaceTab] = useState<'unit_economics' | 'market_size' | 'gtm_validation' | 'assumptions'>('unit_economics');

  // Currently active scenario
  const currentScenario = scenarios[activeScenarioId] || scenarios['base'];

  // Editable scenario inputs state
  const [editAOV, setEditAOV] = useState(currentScenario.avgOrderValue);
  const [editCommissionRate, setEditCommissionRate] = useState(currentScenario.commissionRate * 100);
  const [editCustomers, setEditCustomers] = useState(currentScenario.customersPerMonth);
  const [editPurchasesPerCust, setEditPurchasesPerCust] = useState(currentScenario.purchasesPerCustomer);
  const [editVarCost, setEditVarCost] = useState(currentScenario.variableCostPerTxn);
  const [editFixedCosts, setEditFixedCosts] = useState(currentScenario.fixedCostsPerMonth);

  // Sync state when switching scenario tab
  const handleScenarioSelect = (id: 'conservative' | 'base' | 'ambitious') => {
    setActiveScenarioId(id);
    const scen = scenarios[id];
    setEditAOV(scen.avgOrderValue);
    setEditCommissionRate(scen.commissionRate * 100);
    setEditCustomers(scen.customersPerMonth);
    setEditPurchasesPerCust(scen.purchasesPerCustomer);
    setEditVarCost(scen.variableCostPerTxn);
    setEditFixedCosts(scen.fixedCostsPerMonth);
  };

  const handleSaveScenarioChanges = () => {
    updateScenario(activeScenarioId, {
      avgOrderValue: Number(editAOV),
      commissionRate: Number(editCommissionRate) / 100,
      customersPerMonth: Number(editCustomers),
      purchasesPerCustomer: Number(editPurchasesPerCust),
      variableCostPerTxn: Number(editVarCost),
      fixedCostsPerMonth: Number(editFixedCosts),
    });
  };

  // Calculations for current projection
  const calculatedTransactions = Math.round(editCustomers * editPurchasesPerCust);
  const commissionPerTxn = Math.round(editAOV * (editCommissionRate / 100));
  const monthlyRevenue = calculatedTransactions * commissionPerTxn;
  const contributionPerTxn = commissionPerTxn - editVarCost;
  const monthlyContribution = calculatedTransactions * contributionPerTxn;
  const monthlyOperatingSurplus = monthlyContribution - editFixedCosts;

  // Actual measured results from live app state (for reality check)
  const actualCompletedOrders = purchaseRequests.filter(r => r.status === 'completed');
  const actualGMV = actualCompletedOrders.reduce((sum, r) => sum + r.totalAmount, 0);
  const actualCommissionRevenue = Math.round(actualGMV * 0.10);

  // 30-Day MVP Targets Checklist
  const targetUsers = 100;
  const targetRetailers = 20;
  const targetCompletedOrders = 50;

  const currentUsers = 114; // From week 1 validation interviews & customer discovery
  const currentRetailers = stores.length;
  const currentCompletedOrders = actualCompletedOrders.length;

  // Edit Milestone Modal
  const [editingMilestone, setEditingMilestone] = useState<ValidationMilestone | null>(null);
  const [milestoneActual, setMilestoneActual] = useState(0);
  const [milestoneNotes, setMilestoneNotes] = useState('');
  const [milestoneStatus, setMilestoneStatus] = useState<ValidationMilestone['status']>('in_progress');

  // Edit Assumption Modal
  const [editingAssumption, setEditingAssumption] = useState<CoreAssumption | null>(null);
  const [assumptionStatus, setAssumptionStatus] = useState<CoreAssumption['status']>('assumption');
  const [assumptionNotes, setAssumptionNotes] = useState('');
  const [assumptionLearnings, setAssumptionLearnings] = useState('');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
              <span>DGU Venture Quest · Entrepreneurship Venture Workspace</span>
              <span aria-hidden="true">·</span>
              <span>Dehradun Pilot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              Founder Validation & Unit Economics Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Track the 30-day go-to-market validation plan, test variable & fixed cost assumptions, evaluate market capture (TAM/SAM/SOM), and document evidence for core business hypotheses.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-xs shrink-0 space-y-1">
            <div className="text-slate-400 font-medium">30-Day Validation Status:</div>
            <div className="text-emerald-400 font-bold text-sm">Week 3 in Progress</div>
            <div className="text-[11px] text-slate-400">Target Launch: Dehradun Campuses</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setWorkspaceTab('unit_economics')}
          className={`pb-3 px-3.5 transition-colors whitespace-nowrap ${
            workspaceTab === 'unit_economics'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          1. Unit Economics & Scenarios (Section 7)
        </button>

        <button
          onClick={() => setWorkspaceTab('market_size')}
          className={`pb-3 px-3.5 transition-colors whitespace-nowrap ${
            workspaceTab === 'market_size'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          2. Market Opportunity TAM/SAM/SOM (Section 8)
        </button>

        <button
          onClick={() => setWorkspaceTab('gtm_validation')}
          className={`pb-3 px-3.5 transition-colors whitespace-nowrap ${
            workspaceTab === 'gtm_validation'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          3. 30-Day Validation Plan (Section 9)
        </button>

        <button
          onClick={() => setWorkspaceTab('assumptions')}
          className={`pb-3 px-3.5 transition-colors whitespace-nowrap ${
            workspaceTab === 'assumptions'
              ? 'text-emerald-900 border-b-2 border-emerald-800 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          4. 3 Core Business Assumptions (Section 10)
        </button>
      </div>

      {/* TAB 1: UNIT ECONOMICS & SCENARIOS */}
      {workspaceTab === 'unit_economics' && (
        <div className="space-y-6">
          {/* Disclaimer Header */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Planning Assumption Notice:</strong> These figures are venture projections based on the DGU Venture Quest plan. Actualised revenue is calculated separately from measured transactions.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 shrink-0">
              Active Cost Assumption: ₹{editVarCost} / txn
            </span>
          </div>

          {/* Scenario Selector */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl max-w-md">
            {(['conservative', 'base', 'ambitious'] as const).map(id => (
              <button
                key={id}
                onClick={() => handleScenarioSelect(id)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors capitalize ${
                  activeScenarioId === id
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {id === 'conservative' && 'Conservative (₹25 Var)'}
                {id === 'base' && 'Base-Case (₹14 Var)'}
                {id === 'ambitious' && 'Ambitious (₹12 Var)'}
              </button>
            ))}
          </div>

          {/* Interactive Calculator Inputs & Outputs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Controls */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Configurable Planning Variables
                </h3>
                <button
                  onClick={handleSaveScenarioChanges}
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Average Order Value (AOV)</span>
                    <span className="text-emerald-900 font-bold">₹{editAOV}</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={1200}
                    step={50}
                    value={editAOV}
                    onChange={(e) => setEditAOV(Number(e.target.value))}
                    className="w-full accent-emerald-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>₹200 (Stationery item)</span>
                    <span>₹600 (Base)</span>
                    <span>₹1,200 (Grocery basket)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Platform Commission Rate</span>
                    <span className="text-emerald-900 font-bold">{editCommissionRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={20}
                    step={1}
                    value={editCommissionRate}
                    onChange={(e) => setEditCommissionRate(Number(e.target.value))}
                    className="w-full accent-emerald-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>5% (Low margin)</span>
                    <span>10% (Target standard)</span>
                    <span>20% (Premium)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Monthly Customers</label>
                    <input
                      type="number"
                      value={editCustomers}
                      onChange={(e) => setEditCustomers(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Purchases / Customer</label>
                    <input
                      type="number"
                      step={0.1}
                      value={editPurchasesPerCust}
                      onChange={(e) => setEditPurchasesPerCust(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Variable Cost / Txn (₹)</label>
                    <input
                      type="number"
                      value={editVarCost}
                      onChange={(e) => setEditVarCost(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                    />
                    <span className="text-[10px] text-slate-400">₹14 base / ₹25 scenario</span>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Monthly Fixed Costs (₹)</label>
                    <input
                      type="number"
                      value={editFixedCosts}
                      onChange={(e) => setEditFixedCosts(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold"
                    />
                    <span className="text-[10px] text-slate-400">₹30,000 base plan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Financial Equations Output */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Model Outputs & Unit Equations
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {scenarios[activeScenarioId]?.name || 'Financial Projection'}
                </h3>
              </div>

              {/* Formula Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[11px]">Monthly Transactions</div>
                  <div className="text-xl font-bold text-slate-900">{calculatedTransactions}</div>
                  <div className="text-[10px] text-slate-400">
                    {editCustomers} customers × {editPurchasesPerCust} orders/mo
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[11px]">Platform Commission / Txn</div>
                  <div className="text-xl font-bold text-emerald-950">₹{commissionPerTxn}</div>
                  <div className="text-[10px] text-slate-400">
                    {editCommissionRate}% of ₹{editAOV} AOV
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[11px]">Contribution Margin / Txn</div>
                  <div className="text-xl font-bold text-emerald-900">₹{contributionPerTxn}</div>
                  <div className="text-[10px] text-slate-400">
                    ₹{commissionPerTxn} revenue − ₹{editVarCost} var cost
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-slate-500 text-[11px]">Monthly Revenue</div>
                  <div className="text-xl font-bold text-slate-900">₹{monthlyRevenue.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-400">
                    {calculatedTransactions} txns × ₹{commissionPerTxn}
                  </div>
                </div>
              </div>

              {/* Bottom Line Surplus / Loss Box */}
              <div className={`p-5 rounded-xl border ${
                monthlyOperatingSurplus >= 0
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-red-50/70 border-red-300 text-red-950'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider">
                      Estimated Monthly Operating Surplus / (Loss)
                    </div>
                    <div className="text-2xl font-black mt-1">
                      ₹{monthlyOperatingSurplus.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-xs text-right sm:max-w-xs leading-relaxed">
                    Total Monthly Contribution: <strong>₹{monthlyContribution.toLocaleString('en-IN')}</strong>
                    <br />
                    Less Fixed Costs: <strong>₹{editFixedCosts.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Base-Case Benchmark Callout */}
              <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-600 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800">DGU Venture Base-Case Comparison:</div>
                <p className="text-[11px] leading-relaxed">
                  In the base plan: 800 transactions × ₹60 commission = <strong>₹48,000 revenue</strong>. 
                  Contribution = ₹60 − ₹14 = ₹46/txn (<strong>₹36,800</strong> monthly). 
                  After ₹30,000 fixed overheads = <strong>+₹6,800 monthly operating surplus</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MARKET OPPORTUNITY TAM/SAM/SOM */}
      {workspaceTab === 'market_size' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
            <strong>Preliminary Planning Estimates:</strong> Dehradun local retail & college market opportunity from venture plan. Assumes ₹7,200 annual spend per customer (₹600/month).
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TAM */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Total Addressable Market
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                ₹{MARKET_SIZING.tamCrore} Crore
              </div>
              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div><strong>Target Population:</strong> {MARKET_SIZING.totalPotentialCustomers.toLocaleString('en-IN')} residents & students in Dehradun</div>
                <div><strong>Annual Spend:</strong> ₹{MARKET_SIZING.assumedAnnualSpend} / person</div>
                <div className="text-[11px] text-slate-400 pt-1">
                  All local retail spend on groceries, stationery, and personal goods across the Dehradun district.
                </div>
              </div>
            </div>

            {/* SAM */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                Serviceable Addressable Market
              </div>
              <div className="text-3xl font-extrabold text-emerald-950">
                ₹{MARKET_SIZING.samCrore} Crore
              </div>
              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div><strong>Serviceable Segment:</strong> {MARKET_SIZING.serviceableCustomers.toLocaleString('en-IN')} students & young professionals</div>
                <div><strong>Geographic Scope:</strong> Campuses & core urban clusters</div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Students from UPES, Graphic Era, DIT, DAV PG College, and surrounding student housing hubs.
                </div>
              </div>
            </div>

            {/* SOM */}
            <div className="bg-white border border-emerald-300 rounded-2xl p-6 shadow-xs space-y-3 bg-emerald-50/20">
              <div className="text-xs font-bold text-emerald-900 uppercase tracking-widest">
                Serviceable Obtainable Market (SOM)
              </div>
              <div className="text-3xl font-extrabold text-emerald-900">
                ₹{MARKET_SIZING.somCrore} Crore
              </div>
              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div><strong>Initial Year 1 Target:</strong> {MARKET_SIZING.obtainableCustomers.toLocaleString('en-IN')} active adopters</div>
                <div><strong>Platform Commission Potential:</strong> ~₹28.8 Lakhs</div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Focused first on Premnagar, Karanpur, and Rajpur Road early adopters.
                </div>
              </div>
            </div>
          </div>

          {/* Visual Market Capture Ladder */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Market Capture Funnel Representation</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>TAM (Dehradun Total): 200,000 Potential Customers</span>
                  <span className="text-slate-500">100% (₹144 Cr)</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 w-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>SAM (Campuses & Youth Urban): 50,000 Customers</span>
                  <span className="text-emerald-800">25% of TAM (₹36 Cr)</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 w-1/4"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>SOM (Initial Launch Target): 4,000 Customers</span>
                  <span className="text-emerald-900">2% of TAM (₹2.88 Cr)</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-900 w-[8%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 30-DAY GO-TO-MARKET VALIDATION EXPERIMENT */}
      {workspaceTab === 'gtm_validation' && (
        <div className="space-y-6">
          {/* Overall Targets Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">30-Day Validation Pilot</span>
                <h3 className="text-base font-bold text-slate-900">MVP Success Target Progress</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Dehradun Experiment</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Target 1: Registered Users */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Target 1: Registered Users</span>
                  <span className="font-bold text-slate-900">{currentUsers} / {targetUsers}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-700 transition-all"
                    style={{ width: `${Math.min(100, (currentUsers / targetUsers) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-emerald-800 font-bold">
                  ✓ Target Achieved ({Math.round((currentUsers / targetUsers) * 100)}%)
                </div>
              </div>

              {/* Target 2: Retailers */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Target 2: Retailers Onboarded</span>
                  <span className="font-bold text-slate-900">{currentRetailers} / {targetRetailers}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-700 transition-all"
                    style={{ width: `${Math.min(100, (currentRetailers / targetRetailers) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {Math.round((currentRetailers / targetRetailers) * 100)}% Progress (10-15 Target for W3)
                </div>
              </div>

              {/* Target 3: Completed Orders */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Target 3: Completed Orders</span>
                  <span className="font-bold text-slate-900">{actualCompletedOrders.length} / {targetCompletedOrders}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 transition-all"
                    style={{ width: `${Math.min(100, (actualCompletedOrders.length / targetCompletedOrders) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {Math.round((actualCompletedOrders.length / targetCompletedOrders) * 100)}% Completed at counter
                </div>
              </div>
            </div>
          </div>

          {/* 4-Week Milestone Cards */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Weekly Milestone Breakdown & Field Notes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {validationMilestones.map(milestone => (
                <div
                  key={milestone.week}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                        Week {milestone.week}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        milestone.status === 'achieved'
                          ? 'bg-emerald-50 text-emerald-800'
                          : milestone.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {milestone.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      {milestone.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {milestone.targetDescription}
                    </p>

                    <div className="bg-slate-50 p-2.5 rounded-lg text-xs flex justify-between font-medium">
                      <span className="text-slate-500">{milestone.metricLabel}:</span>
                      <span className="text-slate-900 font-bold">
                        Actual: {milestone.actualValue} (Target: {milestone.targetValue})
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 italic">
                      "{milestone.notes}"
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => {
                        setEditingMilestone(milestone);
                        setMilestoneActual(milestone.actualValue);
                        setMilestoneNotes(milestone.notes);
                        setMilestoneStatus(milestone.status);
                      }}
                      className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Update Actuals & Learning Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 3 CORE ASSUMPTIONS TRACKER */}
      {workspaceTab === 'assumptions' && (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
            <strong>Evidence-Based Validation:</strong> Distinguish between unvalidated assumptions, observed data, and validated conclusions.
          </div>

          <div className="space-y-4">
            {coreAssumptions.map(assumption => (
              <div
                key={assumption.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      assumption.status === 'validated'
                        ? 'bg-emerald-100 text-emerald-900 font-extrabold'
                        : assumption.status === 'observing'
                        ? 'bg-amber-100 text-amber-900 font-bold'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {assumption.status === 'validated' && '✓ Validated Hypothesis'}
                      {assumption.status === 'observing' && '⚡ Observing Field Evidence'}
                      {assumption.status === 'assumption' && '❓ Unvalidated Assumption'}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">
                      {assumption.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      setEditingAssumption(assumption);
                      setAssumptionStatus(assumption.status);
                      setAssumptionNotes(assumption.evidenceNotes);
                      setAssumptionLearnings(assumption.keyLearnings);
                    }}
                    className="self-start sm:self-auto text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Evidence Status
                  </button>
                </div>

                <div className="space-y-3 text-xs text-slate-700">
                  <div>
                    <span className="font-bold text-slate-900">Hypothesis:</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{assumption.hypothesis}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-900">Measured Evidence & Observations:</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed">{assumption.evidenceNotes}</p>
                  </div>

                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="font-bold text-emerald-950">Key Strategic Learnings:</span>
                    <p className="text-emerald-900 mt-0.5 leading-relaxed">{assumption.keyLearnings}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Milestone Modal */}
      {editingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Update {editingMilestone.title}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Actual Measured Value</label>
                <input
                  type="number"
                  value={milestoneActual}
                  onChange={(e) => setMilestoneActual(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={milestoneStatus}
                  onChange={(e) => setMilestoneStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="achieved">Achieved</option>
                  <option value="needs_pivot">Needs Pivot</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Field Observations & Notes</label>
                <textarea
                  rows={3}
                  value={milestoneNotes}
                  onChange={(e) => setMilestoneNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingMilestone(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateValidationMilestone(editingMilestone.week, milestoneActual, milestoneNotes, milestoneStatus);
                  setEditingMilestone(null);
                }}
                className="px-4 py-2 bg-emerald-800 text-white font-bold text-xs rounded-lg hover:bg-emerald-900"
              >
                Save Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Assumption Modal */}
      {editingAssumption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Update {editingAssumption.title}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Validation Status</label>
                <select
                  value={assumptionStatus}
                  onChange={(e) => setAssumptionStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  <option value="assumption">Unvalidated Assumption</option>
                  <option value="observing">Observing (Field Data Gathering)</option>
                  <option value="validated">Validated Evidence</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observation Notes</label>
                <textarea
                  rows={3}
                  value={assumptionNotes}
                  onChange={(e) => setAssumptionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Learnings & Action Items</label>
                <textarea
                  rows={3}
                  value={assumptionLearnings}
                  onChange={(e) => setAssumptionLearnings(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingAssumption(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateCoreAssumption(editingAssumption.id, {
                    status: assumptionStatus,
                    evidenceNotes: assumptionNotes,
                    keyLearnings: assumptionLearnings,
                  });
                  setEditingAssumption(null);
                }}
                className="px-4 py-2 bg-emerald-800 text-white font-bold text-xs rounded-lg hover:bg-emerald-900"
              >
                Save Assumption Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
