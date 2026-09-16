import React, { useState } from 'react';
import { useDrone } from '../../context/DroneContext';
import TopNavbar from './TopNavbar';
import TelemetryBar from './TelemetryBar';
import DualCameraView from './DualCameraView';
import TacticalMap from './TacticalMap';
import DetectionLogPanel from './DetectionLogPanel';
import PayloadControls from './PayloadControls';
import MissionReportModal from './MissionReportModal';
import DroneConnectionModal from './DroneConnectionModal';
import DroneHardwareDetailPanel from './DroneHardwareDetailPanel';
import EmergencySOSModal from './EmergencySOSModal';
import RescueWorkflowBar from './RescueWorkflowBar';
import SensorSuitePanel from './SensorSuitePanel';
import SystemArchitectureModal from './SystemArchitectureModal';
import ReconVaultModal from './ReconVaultModal';

const Dashboard = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isDroneModalOpen, setIsDroneModalOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

  const { triggerEmergencySOS } = useDrone();

  const handleOpenSOS = () => {
    triggerEmergencySOS();
    setIsSOSModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar with Emergency SOS, Drone Link & Architecture Diagram */}
      <TopNavbar 
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenDroneModal={() => setIsDroneModalOpen(true)}
        onOpenSOSModal={handleOpenSOS}
        onOpenDiagramModal={() => setIsDiagramModalOpen(true)}
        onOpenVaultModal={() => setIsVaultModalOpen(true)}
      />

      {/* Flight Telemetry Status Strip */}
      <TelemetryBar />

      {/* Main Mission Content */}
      <main className="flex-1 p-3 sm:p-4 space-y-4 max-w-[1920px] mx-auto w-full">
        {/* 1. Interactive 5-Stage Mission Workflow Tracker (Search • Detect • Rescue • Save Lives) */}
        <section className="w-full">
          <RescueWorkflowBar />
        </section>

        {/* 2. Onboard Sensors & Hardware Suite (Ultrasonic, 4K Cam, FLIR, GPS, Env Sensors, Battery, FCU, Comm) */}
        <section className="w-full">
          <SensorSuitePanel />
        </section>

        {/* 3. Live Drone Hardware Specifications & Telemetry Details */}
        <section className="w-full">
          <DroneHardwareDetailPanel onOpenConnectModal={() => setIsDroneModalOpen(true)} />
        </section>

        {/* 4. Top Video Section: Dual Optical & Thermal Video Feeds */}
        <section className="w-full">
          <DualCameraView />
        </section>

        {/* 5. Middle Section: Tactical Map + AI Detection Triage List */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Tactical Radar Map (7 cols on desktop) */}
          <div className="lg:col-span-7 h-[480px] min-h-[420px]">
            <TacticalMap onOpenVaultModal={() => setIsVaultModalOpen(true)} />
          </div>

          {/* AI Detection & Triage Management (5 cols on desktop) */}
          <div className="lg:col-span-5 h-[480px] min-h-[420px]">
            <DetectionLogPanel />
          </div>
        </section>

        {/* 6. Bottom Section: Rescue Payload Release & Autopilot Controls */}
        <section className="w-full">
          <PayloadControls />
        </section>
      </main>

      {/* Aerial Reconnaissance Intel Vault Modal */}
      <ReconVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
      />

      {/* Automated Multi-Agency Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
      />

      {/* System Architecture & Connection Schematic Modal */}
      <SystemArchitectureModal
        isOpen={isDiagramModalOpen}
        onClose={() => setIsDiagramModalOpen(false)}
      />

      {/* SAR Mission Report & Export Modal */}
      <MissionReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />

      {/* Drone Hardware Link & Capture Card Bridge Modal */}
      <DroneConnectionModal
        isOpen={isDroneModalOpen}
        onClose={() => setIsDroneModalOpen(false)}
      />


    </div>
  );
};

export default Dashboard;
