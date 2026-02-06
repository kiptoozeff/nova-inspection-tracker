import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './App.css';

function App() {
  const [inspections, setInspections] = useState([]);
  const [formData, setFormData] = useState({
    vehicle_plate: '',
    inspection_date: new Date(),
    status: 'scheduled',
    notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});

  const API_URL = '/api/inspections/';

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      const response = await axios.get(API_URL);
      setInspections(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching inspections:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const data = {
      ...formData,
      inspection_date: formData.inspection_date.toISOString().split('T')[0]
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}${editingId}/`, data);
        setEditingId(null);
      } else {
        await axios.post(API_URL, data);
      }
      
      setFormData({
        vehicle_plate: '',
        inspection_date: new Date(),
        status: 'scheduled',
        notes: ''
      });
      
      fetchInspections();
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    }
  };

  const handleEdit = (inspection) => {
    setFormData({
      vehicle_plate: inspection.vehicle_plate,
      inspection_date: new Date(inspection.inspection_date),
      status: inspection.status,
      notes: inspection.notes || ''
    });
    setEditingId(inspection.id);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const inspection = inspections.find(i => i.id === id);
      await axios.put(`${API_URL}${id}/`, {
        ...inspection,
        status: newStatus
      });
      fetchInspections();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'passed': return 'status-passed';
      case 'failed': return 'status-failed';
      default: return 'status-scheduled';
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>NovaFleet Vehicle Inspection Tracker</h1>
      </header>

      <div className="container">
        <div className="form-section">
          <h2>{editingId ? 'Edit Inspection' : 'Schedule New Inspection'}</h2>
          <form onSubmit={handleSubmit} className="inspection-form">
            <div className="form-group">
              <label htmlFor="vehicle_plate">Vehicle Plate*</label>
              <input
                type="text"
                id="vehicle_plate"
                value={formData.vehicle_plate}
                onChange={(e) => setFormData({...formData, vehicle_plate: e.target.value})}
                required
                placeholder="ABC-1234"
              />
              {errors.vehicle_plate && <span className="error">{errors.vehicle_plate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="inspection_date">Inspection Date*</label>
              <DatePicker
                selected={formData.inspection_date}
                onChange={(date) => setFormData({...formData, inspection_date: date})}
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                className="date-picker"
              />
              {errors.inspection_date && <span className="error">{errors.inspection_date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status*</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="scheduled">Scheduled</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
              {errors.status && <span className="error">{errors.status}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes..."
                rows="3"
              />
            </div>

            <button type="submit" className="submit-btn">
              {editingId ? 'Update Inspection' : 'Schedule Inspection'}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    vehicle_plate: '',
                    inspection_date: new Date(),
                    status: 'scheduled',
                    notes: ''
                  });
                }}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="list-section">
          <h2>All Inspections ({inspections.length})</h2>
          <div className="inspections-list">
            {inspections.length === 0 ? (
              <p className="empty-message">No inspections scheduled yet.</p>
            ) : (
              inspections.map((inspection) => (
                <div key={inspection.id} className="inspection-card">
                  <div className="card-header">
                    <span className={`status-badge ${getStatusColor(inspection.status)}`}>
                      {inspection.status.toUpperCase()}
                    </span>
                    <span className="vehicle-plate">{inspection.vehicle_plate}</span>
                    <span className="inspection-date">
                      {new Date(inspection.inspection_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {inspection.notes && (
                    <div className="card-notes">
                      <p>{inspection.notes}</p>
                    </div>
                  )}

                  <div className="card-actions">
                    <button 
                      onClick={() => handleEdit(inspection)}
                      className="action-btn edit-btn"
                    >
                      Edit
                    </button>
                    
                    <div className="status-actions">
                      <button 
                        onClick={() => handleStatusUpdate(inspection.id, 'passed')}
                        className={`status-btn ${inspection.status === 'passed' ? 'active' : ''}`}
                      >
                        Mark Passed
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(inspection.id, 'failed')}
                        className={`status-btn ${inspection.status === 'failed' ? 'active' : ''}`}
                      >
                        Mark Failed
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <small>
                      Created: {new Date(inspection.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;