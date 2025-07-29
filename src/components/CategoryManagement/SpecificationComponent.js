// SpecificationComponent.js
import React from 'react';

const SpecificationComponent = ({ itemData, itemType }) => {
  const getSpecifications = () => {
    switch (itemType) {
      case 'trending':
        return {
          Microcontroller: itemData.microcontroller || 'N/A',
          'Operating Voltage': itemData.operatingVoltage || 'N/A',
          'Input Voltage (Recommended)': itemData.inputVoltageRecommended || 'N/A',
          'Input Voltage (Limits)': itemData.inputVoltageLimits || 'N/A',
          'Digital I/O Pins': itemData.digitalIOPins || 'N/A',
          'Analog Input Pins': itemData.analogInputPins || 'N/A',
          'PWM Channels': itemData.pwmChannels || 'N/A',
          'Clock Speed': itemData.clockSpeed || 'N/A',
          'Flash Memory': itemData.flashMemory || 'N/A',
          'SRAM': itemData.sram || 'N/A',
          'EEPROM': itemData.eeprom || 'N/A',
          'USB Interface': itemData.usbInterface || 'N/A',
          'Communication Interfaces': itemData.communicationInterfaces || 'N/A',
          'Dimensions': itemData.dimensions || 'N/A',
          'Weight': itemData.weight || 'N/A',
          'Operating Temperature': itemData.operatingTemperature || 'N/A',
          'Power Consumption': itemData.powerConsumption || 'N/A',
          'LED Indicators': itemData.ledIndicators || 'N/A',
        };
      case 'categoryItems':
        return {
          'Category Name': itemData.categoryName || 'N/A',
          'Item Name': itemData.name || 'N/A',
          'Price': itemData.price ? `₹${itemData.price.toFixed(2)}` : 'N/A',
          'Material': itemData.material || 'N/A',
          'Dimensions': itemData.dimensions || 'N/A',
          'Weight': itemData.weight || 'N/A',
          'Warranty': itemData.warranty || 'N/A',
          'Delivery Speed': itemData.deliverySpeed || 'N/A',
        };
      default:
        return {};
    }
  };

  const specifications = getSpecifications();

  return (
    <div className="card spec-card">
      <h2>Specifications of {itemData.name || 'Uploaded Item'}</h2>
      <table>
        <tbody>
          {Object.entries(specifications).map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SpecificationComponent;