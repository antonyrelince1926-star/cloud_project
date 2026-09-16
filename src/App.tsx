import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MfaModal } from './components/MfaModal';
import { AdminDashboard } from './components/AdminDashboard';
import { SetterView } from './components/SetterView';
import { ReviewerView } from './components/ReviewerView';
import { CentreView } from './components/CentreView';
import { SecurityTestScenarios } from './components/SecurityTestScenarios';
import { AuditLogView } from './components/AuditLogView';
import { ArchitectureDeliverablesView } from './components/ArchitectureDeliverablesView';
import { VaultIntegrityDashboard } from './components/VaultIntegrityDashboard';
import { Lock, Shield, ExternalLink, Info } from 'lucide-react';

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('admin');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f6] text-[#222222]">
      {/* Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenLogin={() => setIsLoginModalOpen(true)} 
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'admin' && (
          <AdminDashboard 
            onNavigateToVault={() => setActiveTab('vault')} 
            onNavigateToArchitecture={() => setActiveTab('architecture')}
          />
        )}
        {activeTab === 'vault' && <VaultIntegrityDashboard />}
        {activeTab === 'setter' && <SetterView onNavigateTab={(tab) => setActiveTab(tab)} />}
        {activeTab === 'reviewer' && <ReviewerView onNavigateTab={(tab) => setActiveTab(tab)} />}
        {activeTab === 'centre' && <CentreView onNavigateTab={(tab) => setActiveTab(tab)} />}
        {activeTab === 'scenarios' && <SecurityTestScenarios />}
        {activeTab === 'audit' && <AuditLogView />}
        {activeTab === 'architecture' && (
          <ArchitectureDeliverablesView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}
      </main>

      {/* MFA & Authentication Modal */}
      <MfaModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* Section 34 Prototype Disclosure & Footer */}
      <footer className="bg-white border-t border-[#e5e5ea] py-6 text-xs text-[#6b7280]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-[#222222] flex items-center justify-center text-white">
              <Shield className="w-3 h-3 text-[#e95d2a]" />
            </div>
            <span className="font-extrabold text-[#222222]">
              ZERO-TRUST SPLIT-SEAL ARCHITECTURE
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#fef3ee] text-[#e95d2a] font-bold">
              ACADEMIC PROTOTYPE
            </span>
          </div>

          <div className="text-[11px] text-center md:text-right leading-relaxed max-w-2xl">
            <strong>Prototype Implementation Notice (Section 34):</strong> This application demonstrates real WebCrypto AES-256-GCM, fragmented vault storage (Store A/B/C), 3-of-5 threshold custody, and digital signature validation. Multi-container Docker & KMS abstractions simulate cloud-distributed physical isolation.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
