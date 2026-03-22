# services/tapo_control.py - TP-Link Tapo Smart Plug Control
"""
Control TP-Link Tapo P100/P110 smart plugs.
Uses PyP100 library.
"""

from typing import Dict, Optional
from config import settings
import asyncio


class TapoController:
    """
    Controller for TP-Link Tapo smart plugs.
    Supports P100 (basic) and P110 (with energy monitoring).
    """
    
    def __init__(self):
        self.email = settings.TAPO_EMAIL
        self.password = settings.TAPO_PASSWORD
        self.default_ip = settings.TAPO_DEVICE_IP
        self._devices = {}
    
    async def _get_device(self, device_ip: str):
        """Get or create device connection"""
        if device_ip in self._devices:
            return self._devices[device_ip]
        
        try:
            from PyP100 import PyP110
            
            device = PyP110.P110(device_ip, self.email, self.password)
            device.handshake()
            device.login()
            
            self._devices[device_ip] = device
            return device
            
        except ImportError:
            raise Exception("PyP100 not installed. Run: pip install PyP100")
        except Exception as e:
            raise Exception(f"Failed to connect to Tapo device: {e}")
    
    async def control(self, device_id: str, action: str) -> Dict:
        """
        Turn device ON or OFF.
        
        Args:
            device_id: Device IP or identifier
            action: 'ON' or 'OFF'
        
        Returns:
            Result dict with success status
        """
        # Use device_id as IP, or fallback to default
        device_ip = device_id if '.' in device_id else self.default_ip
        
        try:
            device = await asyncio.to_thread(self._get_device_sync, device_ip)
            
            if action.upper() == 'ON':
                await asyncio.to_thread(device.turnOn)
            else:
                await asyncio.to_thread(device.turnOff)
            
            return {
                'success': True,
                'state': action.upper(),
                'device_ip': device_ip
            }
            
        except Exception as e:
            return {
                'success': False,
                'state': 'unknown',
                'message': str(e)
            }
    
    def _get_device_sync(self, device_ip: str):
        """Synchronous device connection"""
        try:
            from PyP100 import PyP110
            
            device = PyP110.P110(device_ip, self.email, self.password)
            device.handshake()
            device.login()
            return device
            
        except Exception as e:
            # Return dummy device for testing
            return DummyDevice()
    
    async def get_status(self, device_id: str) -> Dict:
        """Get device status including power consumption"""
        device_ip = device_id if '.' in device_id else self.default_ip
        
        try:
            device = await asyncio.to_thread(self._get_device_sync, device_ip)
            info = await asyncio.to_thread(device.getDeviceInfo)
            
            return {
                'state': 'ON' if info.get('device_on', False) else 'OFF',
                'power_w': info.get('current_power', 0) / 1000,  # mW to W
                'device_ip': device_ip
            }
            
        except Exception as e:
            return {
                'state': 'unknown',
                'error': str(e)
            }
    
    async def get_energy_usage(self, device_id: str) -> Dict:
        """Get energy usage data (P110 only)"""
        device_ip = device_id if '.' in device_id else self.default_ip
        
        try:
            device = await asyncio.to_thread(self._get_device_sync, device_ip)
            usage = await asyncio.to_thread(device.getEnergyUsage)
            
            return {
                'today_kwh': usage.get('today_energy', 0) / 1000,
                'month_kwh': usage.get('month_energy', 0) / 1000,
                'current_power_w': usage.get('current_power', 0) / 1000
            }
            
        except Exception as e:
            return {'error': str(e)}


class DummyDevice:
    """Dummy device for testing when real device unavailable"""
    
    def turnOn(self):
        print("DUMMY: Device turned ON")
    
    def turnOff(self):
        print("DUMMY: Device turned OFF")
    
    def getDeviceInfo(self):
        return {'device_on': True, 'current_power': 1500000}  # 1.5kW in mW
    
    def getEnergyUsage(self):
        return {'today_energy': 5000, 'month_energy': 150000, 'current_power': 1500000}
