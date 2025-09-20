import SettingsLayout from "@/components/SettingsLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface QROverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const QROverlay: React.FC<QROverlayProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative max-w-md w-full mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-center">Scan QR Code</h4>
          <div className="flex justify-center">
            <img
              src="/qrcode_www.sakarrobotics.com.png"
              alt="Report Issue QR Code"
              className="w-64 h-64 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Help = () => {
  const [isQROpen, setIsQROpen] = useState(false);
  
    const helpSections = {
    "Introduction": "Welcome to the Guard Surveillance Robot Control Dashboard. This advanced interface serves as your central command center for managing and monitoring the Guard robot system. The dashboard provides comprehensive control over surveillance operations, real-time communication capabilities, and detailed system monitoring. Whether you're conducting routine patrols or responding to security events, this interface puts all essential controls and information at your fingertips.",
    
    "Getting Started / Basics": "The dashboard is designed with an intuitive layout featuring three main components: The Header Bar, Main Control Area, and Navigation Bar. The Header Bar displays critical system information including connection status, battery level, recording state, and system temperatures. The Main Control Area provides access to voice communications, patrol controls, and real-time video feeds. The Bottom Navigation Bar allows quick switching between different dashboard sections. Basic operations like initiating voice communication, starting patrols, and accessing settings are all available through clearly labeled buttons and controls.",
    
    "Dashboard Layout": "The interface is organized into distinct sections for efficient operation: \n\n1. Header Bar (Top): \n- Connection status indicator \n- Battery level display \n- Recording status \n- System temperature monitor \n- Quick access settings \n\n2. Main Control Area (Center): \n- Push-to-Talk controls \n- Live video feed \n- Patrol status and controls \n- System messages and alerts \n\n3. Navigation Bar (Bottom): \n- Main dashboard view \n- Settings access \n- System status page \n- Help section",
    
    "Communication Features": "The Guard robot features advanced two-way communication capabilities: \n\n1. Push-to-Talk (PTT): \n- Press and hold to transmit voice \n- Release to listen \n- Visual feedback for transmission status \n- Volume control available \n\n2. Audio Settings: \n- Adjustable microphone sensitivity \n- Speaker volume control \n- Echo cancellation options \n- Audio quality indicators \n\n3. Emergency Communications: \n- Priority channel access \n- Emergency broadcast mode \n- Automatic alert system",
    
    "Patrol & Surveillance": "Understanding patrol operations and surveillance features: \n\n1. Patrol Modes: \n- Automated patrols along predefined routes \n- Manual control mode for direct navigation \n- Hybrid mode with automated and manual control \n\n2. Surveillance Features: \n- Real-time video monitoring \n- Motion detection alerts \n- Area mapping and coverage display \n- Event logging and reporting \n\n3. Control Options: \n- Speed and direction controls \n- Camera pan/tilt/zoom \n- Light controls for low-light conditions \n- Emergency stop function",
    
    "System Status Monitoring": "Comprehensive system monitoring includes: \n\n1. Power Management: \n- Battery level monitoring \n- Power consumption analysis \n- Charging status and estimates \n- Low battery alerts \n\n2. Network Connectivity: \n- Signal strength indicator \n- Network quality metrics \n- Connection type display \n- Bandwidth usage stats \n\n3. Hardware Status: \n- Motor health indicators \n- Camera system status \n- Sensor readings \n- Temperature monitoring",
    
    "Settings & Configuration": "Detailed guide to system settings: \n\n1. Network Settings: \n- WiFi configuration \n- Connection priority \n- Network diagnostics \n- Remote access setup \n\n2. Audio Settings: \n- Input/Output selection \n- Volume controls \n- Audio processing options \n- Communication preferences \n\n3. Display Settings: \n- Interface themes \n- Brightness control \n- Information density \n- Alert preferences",
    
    "Safety Features": "Critical safety systems and procedures: \n\n1. Emergency Protocols: \n- Emergency stop procedures \n- Fail-safe mechanisms \n- Safety override controls \n- Alert system configuration \n\n2. Obstacle Avoidance: \n- Sensor system overview \n- Avoidance parameters \n- Manual override options \n- Safety zone settings \n\n3. System Limits: \n- Operating boundaries \n- Speed restrictions \n- Power management \n- Environmental constraints",
    
    "Maintenance & Updates": "System maintenance procedures: \n\n1. Software Updates: \n- Update checking \n- Installation process \n- Rollback procedures \n- Version management \n\n2. Routine Maintenance: \n- Cleaning procedures \n- Calibration checks \n- Sensor validation \n- System diagnostics \n\n3. Preventive Care: \n- Regular inspections \n- Performance monitoring \n- Component lifetime tracking \n- Maintenance scheduling",
    
    "Troubleshooting Guide": "Step-by-step troubleshooting procedures: \n\n1. Connection Issues: \n- Network diagnostics \n- Signal strength optimization \n- Connection recovery steps \n- Alternative connection methods \n\n2. Performance Problems: \n- System resource monitoring \n- Performance optimization \n- Cache clearing procedures \n- Resource management \n\n3. Hardware Issues: \n- Diagnostic procedures \n- Component testing \n- Sensor calibration \n- Reset procedures",
    
    "Emergency Procedures": "Critical emergency response information: \n\n1. System Failures: \n- Emergency shutdown procedure \n- Safe mode activation \n- Manual override steps \n- Recovery protocols \n\n2. Safety Incidents: \n- Emergency response steps \n- Incident reporting \n- Safety protocol activation \n- Emergency contact procedures \n\n3. Environmental Hazards: \n- Weather protection \n- Environmental limits \n- Hazard avoidance \n- Emergency shelter procedures",
    
    "FAQs": "Comprehensive answers to common questions: \n\n1. Operation Questions: \n- Basic control procedures \n- Feature accessibility \n- System limitations \n- Best practices \n\n2. Technical Questions: \n- System specifications \n- Performance metrics \n- Compatibility information \n- Update procedures \n\n3. Maintenance Questions: \n- Routine care steps \n- Cleaning procedures \n- Component lifetime \n- Replacement guidelines"
  };

  const issueTypes = {
    "Connection / Network Problem": "Follow these steps to diagnose and resolve connection issues:\n\n1. Initial Checks:\n- Verify connection icon status in header bar\n- Check WiFi signal strength indicator\n- Confirm network settings are correct\n- Test other network-dependent features\n\n2. Basic Troubleshooting:\n- Power cycle the robot system\n- Restart the control dashboard\n- Check for physical obstructions\n- Verify WiFi network availability\n\n3. Advanced Steps:\n- Run network diagnostics in settings\n- Test alternative connection methods\n- Check for system updates\n- Verify firewall settings\n\nIf problems persist after these steps, scan the QR code to report detailed connection issues. Include specific symptoms, error messages, and steps already attempted.",

    "GPS / Location Inaccuracy": "Follow this process to resolve location tracking issues:\n\n1. Environment Check:\n- Ensure clear line of sight to sky\n- Move away from tall buildings/obstacles\n- Check for interference sources\n- Verify outdoor operation\n\n2. System Diagnostics:\n- Check GPS signal strength\n- Verify satellite connection count\n- Monitor position update rate\n- Test manual position refresh\n\n3. System Reset Procedure:\n- Save current location data\n- Perform full GPS reset\n- Wait for satellite reacquisition\n- Verify position accuracy\n\nIf location remains inaccurate, scan QR code to report. Include environment details, signal strength, and number of visible satellites.", 

    "Software / Performance Lag": "Address performance issues with these steps:\n\n1. System Health Check:\n- Monitor CPU temperature\n- Check available memory\n- Verify storage space\n- Review running processes\n\n2. Optimization Steps:\n- Close unnecessary processes\n- Clear system cache\n- Check for software updates\n- Verify cooling system operation\n\n3. Advanced Troubleshooting:\n- Run system diagnostics\n- Monitor resource usage\n- Test in safe mode\n- Check error logs\n\nIf performance issues continue, scan QR code to report. Include system temperatures, resource usage stats, and specific lag symptoms.",

    "Robot Control / Movement Error": "Resolution steps for movement issues:\n\n1. Safety Checks:\n- Check for physical obstacles\n- Verify surface conditions\n- Ensure safe operating space\n- Check emergency stop status\n\n2. System Diagnostics:\n- Verify motor power status\n- Check battery charge level\n- Test manual control response\n- Monitor motor temperatures\n\n3. Advanced Diagnostics:\n- Run motor diagnostics\n- Test sensor systems\n- Verify control calibration\n- Check error logs\n\nIf movement issues persist, scan QR code to report. Include specific movement symptoms, error messages, and environmental conditions.",

    "System Crash / App Error": "Follow these recovery steps for system crashes:\n\n1. Immediate Actions:\n- Record any error messages\n- Save important data if possible\n- Note system state before crash\n- Check for pattern in crashes\n\n2. Recovery Steps:\n- Perform safe system restart\n- Check system logs\n- Verify software versions\n- Test basic functions\n\n3. Prevention Measures:\n- Check for updates\n- Verify system requirements\n- Monitor system resources\n- Review recent changes\n\nFor recurring crashes, scan QR code to report. Include exact error messages, crash circumstances, and frequency of occurrences.",

    "Camera / Video Issue": "Resolve camera system issues with these steps:\n\n1. Hardware Checks:\n- Check for physical obstructions\n- Verify lens cleanliness\n- Check camera connections\n- Verify power supply\n\n2. Software Diagnostics:\n- Test camera initialization\n- Check video processing\n- Verify stream settings\n- Monitor frame rate\n\n3. Advanced Troubleshooting:\n- Run camera diagnostics\n- Test different resolutions\n- Check bandwidth usage\n- Verify driver status\n\nIf video issues continue, scan QR code to report. Include specific symptoms, video quality issues, and any error messages.",

    "Audio Communication Problems": "Troubleshoot audio issues using these steps:\n\n1. Basic Checks:\n- Test microphone function\n- Verify speaker operation\n- Check volume settings\n- Test audio feedback\n\n2. System Settings:\n- Verify audio device selection\n- Check input/output levels\n- Test echo cancellation\n- Verify codec settings\n\n3. Advanced Diagnostics:\n- Run audio diagnostics\n- Test alternative devices\n- Check for interference\n- Monitor latency\n\nIf audio problems persist, scan QR code to report. Include specific symptoms, test results, and environmental conditions.",

    "Battery / Power Issues": "Address power-related problems:\n\n1. Power Analysis:\n- Check current charge level\n- Monitor power consumption\n- Verify charging status\n- Test power supply\n\n2. System Impact:\n- Check for high-drain processes\n- Monitor temperature effects\n- Verify sleep mode function\n- Test power management\n\n3. Long-term Solutions:\n- Calibrate battery monitor\n- Check charging cycles\n- Verify battery health\n- Test backup systems\n\nFor persistent power issues, scan QR code to report. Include battery statistics, usage patterns, and specific symptoms.",

    "Sensor System Failures": "Diagnose sensor issues with these steps:\n\n1. Initial Assessment:\n- Check sensor status\n- Verify physical condition\n- Test basic function\n- Monitor error states\n\n2. Diagnostic Steps:\n- Run sensor tests\n- Check calibration\n- Verify data accuracy\n- Test in different conditions\n\n3. Advanced Testing:\n- Run full diagnostics\n- Check interference sources\n- Verify sensor fusion\n- Test redundancy systems\n\nIf sensor problems continue, scan QR code to report. Include sensor data, error states, and environmental conditions."
  };

  return (
    <SettingsLayout>
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">HELP PAGE</h2>
        
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(helpSections).map(([section, description], index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-bold text-lg">
                  {section}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground text-base leading-relaxed py-2">
                    {description}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold">REPORT ISSUE</h3>
            <Button 
              variant="outline"
              onClick={() => setIsQROpen(true)}
            >
              📱 QR for Report Issue
            </Button>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(issueTypes).map(([issue, description], index) => (
              <AccordionItem key={index} value={`issue-${index}`}>
                <AccordionTrigger className="text-left font-bold">
                  {issue}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-base leading-relaxed py-2">
                      {description}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      <QROverlay isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
    </SettingsLayout>
  );
};

export default Help;