import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { addCricketer, getAllCricketers, deleteCricketer, toggleCricketerStatus } from '../services/api';
import '../index.css';

const visibleStatFields = [
  'Age',
  'Birthplace',
  'Role',
  'Matches Played',
  'IPL Team',
  'Runs',
  'Wickets'
];

const hiddenStatFields = ['Country'];

const getRoleVariant = (roleValue) => {
  const role = (roleValue || '').toLowerCase();
  if (role.includes('bowl')) return 'bowler';
  if (role.includes('keeper')) return 'keeper';
  if (role.includes('all')) return 'all-rounder';
  return 'batsman';
};

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [cricketers, setCricketers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    difficulty: 'medium',
    isActive: true,
    hiddenImage: null
  });
  
  const [visibleStats, setVisibleStats] = useState(visibleStatFields.reduce((acc, key) => ({ ...acc, [key]: '' }), {}));
  
  const [hiddenStats, setHiddenStats] = useState(hiddenStatFields.reduce((acc, key) => ({ ...acc, [key]: '' }), {}));

  // Check if user is admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
    }
  }, [user, navigate]);

  // Load existing cricketers
  useEffect(() => {
    loadCricketers();
  }, []);

  const loadCricketers = async () => {
    try {
      const response = await getAllCricketers();
      const fetchedCricketers = response?.data?.data?.cricketers;
      setCricketers(Array.isArray(fetchedCricketers) ? fetchedCricketers : []);
    } catch (err) {
      console.error('Failed to load cricketers:', err);
      setCricketers([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      hiddenImage: selectedFile
    }));
  };

  const handleVisibleStatChange = (key, value) => {
    setVisibleStats(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleHiddenStatChange = (key, value) => {
    setHiddenStats(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Filter out empty stats
      const filteredVisibleStats = Object.fromEntries(
        Object.entries(visibleStats).filter(([_, value]) => value.trim() !== '')
      );
      const filteredHiddenStats = Object.fromEntries(
        Object.entries(hiddenStats).filter(([_, value]) => value.trim() !== '')
      );

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('isActive', formData.isActive);
      formDataToSend.append('visibleStats', JSON.stringify(filteredVisibleStats));
      formDataToSend.append('hiddenStats', JSON.stringify(filteredHiddenStats));
      
      if (formData.hiddenImage) {
        formDataToSend.append('hiddenImage', formData.hiddenImage);
      }

      await addCricketer(formDataToSend);
      
      setSuccess('Cricketer added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        difficulty: 'medium',
        isActive: true,
        hiddenImage: null
      });
      setVisibleStats(visibleStatFields.reduce((acc, key) => ({ ...acc, [key]: '' }), {}));
      setHiddenStats(hiddenStatFields.reduce((acc, key) => ({ ...acc, [key]: '' }), {}));
      
      // Reset file input
      const fileInput = document.getElementById('hiddenImage');
      if (fileInput) fileInput.value = '';
      
      // Reload cricketers list
      loadCricketers();
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add cricketer');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const cricketer = (Array.isArray(cricketers) ? cricketers : []).find((item) => item._id === id);
    setDeleteTarget(cricketer || { _id: id, name: 'this cricketer' });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?._id) {
      setShowDeleteModal(false);
      return;
    }

    try {
      await deleteCricketer(deleteTarget._id);
      setSuccess('Cricketer deleted successfully');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      loadCricketers();
    } catch (err) {
      setError('Failed to delete cricketer');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleCricketerStatus(id);
      setSuccess('Cricketer status updated');
      loadCricketers();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  const list = Array.isArray(cricketers) ? cricketers : [];
  const activeCount = list.filter((item) => item.isActive).length;
  const inactiveCount = list.length - activeCount;
  const roleVariant = getRoleVariant(visibleStats.Role);

  return (
    <div className="admin-page">
      <div className="admin-bg-shape admin-bg-shape-a" />
      <div className="admin-bg-shape admin-bg-shape-b" />

      <div className="container admin-container">
        <header className="admin-hero">
          <div>
            <p className="admin-eyebrow">Control Room</p>
            <h1>Cricketer Management</h1>
            <p className="admin-subtitle">
              Add and manage quiz cricketers with role-aware shown image and custom hidden image uploads.
            </p>
          </div>
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <span>Total</span>
              <strong>{list.length}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Active</span>
              <strong>{activeCount}</strong>
            </div>
            <div className="admin-stat-card">
              <span>Inactive</span>
              <strong>{inactiveCount}</strong>
            </div>
          </div>
        </header>

        {error && (
          <div className="alert alert-error admin-alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success admin-alert">
            {success}
          </div>
        )}

        <div className="admin-grid">
          <section className="admin-card admin-form-card">
            <div className="admin-card-head">
              <h2>Add New Cricketer</h2>
              <p>
                Current role profile: <strong>{roleVariant}</strong>
              </p>
            </div>
          
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-field-grid two-cols">
              <div className="admin-field">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Virat Kohli"
                />
              </div>

              <div className="admin-field">
                <label>Difficulty *</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="admin-field">
              <label>
                Hidden Image (optional)
              </label>
              <div className="admin-file-picker">
                <input
                  type="file"
                  id="hiddenImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="admin-file-input"
                />
                <label htmlFor="hiddenImage" className="admin-file-btn">
                  Upload Hidden Image
                </label>
                <span className="admin-file-name">
                  {formData.hiddenImage ? formData.hiddenImage.name : 'No file selected'}
                </span>
              </div>
              <p className="admin-hint">
                Revealed image is selected automatically from role. Hidden image can be your own upload.
              </p>
            </div>

            <label className="admin-toggle">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              <span>Active (available in quiz)</span>
            </label>

            <div className="admin-section-title">Visible Stats (during quiz)</div>
            <div className="admin-field-grid two-cols">
                {Object.keys(visibleStats).map((key) => (
                  <div key={key} className="admin-field">
                    <label>{key}</label>
                    <input
                      type="text"
                      value={visibleStats[key]}
                      onChange={(e) => handleVisibleStatChange(key, e.target.value)}
                      placeholder={`Enter ${key}`}
                    />
                  </div>
                ))}
            </div>

            <div className="admin-section-title">Hidden Stats (after round)</div>
            <div className="admin-field-grid two-cols">
                {Object.keys(hiddenStats).map((key) => (
                  <div key={key} className="admin-field">
                    <label>{key} *</label>
                    <input
                      type="text"
                      value={hiddenStats[key]}
                      onChange={(e) => handleHiddenStatChange(key, e.target.value)}
                      required
                      placeholder={`Enter ${key}`}
                    />
                  </div>
                ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-submit-btn"
            >
              {loading ? 'Adding...' : 'Add Cricketer to Pool'}
            </button>
          </form>
          </section>

          <section className="admin-card admin-list-card">
            <div className="admin-card-head">
              <h2>Existing Cricketers</h2>
              <p>Toggle availability or remove entries from quiz rotation.</p>
            </div>
          
            <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((cricketer) => (
                  <tr key={cricketer._id}>
                    <td>{cricketer.name}</td>
                    <td>
                      <span className={`admin-badge admin-badge-${cricketer.difficulty || 'medium'}`}>
                        {cricketer.difficulty}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${cricketer.isActive ? 'admin-badge-active' : 'admin-badge-inactive'}`}>
                        {cricketer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="admin-actions-cell">
                      <button
                        onClick={() => handleToggleStatus(cricketer._id)}
                        className="admin-table-btn admin-table-btn-toggle"
                      >
                        Toggle
                      </button>
                      <button
                        onClick={() => handleDelete(cricketer._id)}
                        className="admin-table-btn admin-table-btn-delete"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan="4" className="admin-empty-row">No cricketers found yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </section>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');

        .admin-page {
          position: relative;
          min-height: 100vh;
          padding: 2rem 0 3rem;
          background:
            radial-gradient(circle at 12% 18%, rgba(255, 173, 51, 0.22), transparent 40%),
            radial-gradient(circle at 84% 10%, rgba(0, 194, 168, 0.2), transparent 38%),
            linear-gradient(135deg, #071227, #0d1f3c 55%, #102e4f);
          overflow: hidden;
        }

        .admin-bg-shape {
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(2px);
        }

        .admin-bg-shape-a {
          width: 420px;
          height: 420px;
          background: linear-gradient(180deg, rgba(255, 187, 89, 0.2), rgba(255, 187, 89, 0.03));
          top: -180px;
          left: -120px;
          transform: rotate(16deg);
        }

        .admin-bg-shape-b {
          width: 460px;
          height: 460px;
          background: linear-gradient(180deg, rgba(0, 194, 168, 0.2), rgba(0, 194, 168, 0.03));
          bottom: -220px;
          right: -140px;
          transform: rotate(-12deg);
        }

        .admin-container {
          position: relative;
          z-index: 2;
        }

        .admin-hero {
          display: grid;
          grid-template-columns: 1.7fr 1fr;
          gap: 1.5rem;
          align-items: end;
          margin-bottom: 1.5rem;
          animation: riseIn 420ms ease;
        }

        .admin-eyebrow {
          display: inline-block;
          margin-bottom: 0.55rem;
          padding: 0.3rem 0.65rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #9dd9ff;
          font-size: 0.77rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
        }

        .admin-hero h1 {
          margin: 0;
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.65rem);
          line-height: 1.1;
          color: #f0f8ff;
        }

        .admin-subtitle {
          margin-top: 0.7rem;
          max-width: 60ch;
          color: rgba(227, 239, 255, 0.85);
          font-size: 0.98rem;
        }

        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
        }

        .admin-stat-card {
          padding: 0.85rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(4px);
          text-align: center;
        }

        .admin-stat-card span {
          display: block;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: rgba(214, 235, 255, 0.7);
        }

        .admin-stat-card strong {
          display: block;
          margin-top: 0.3rem;
          font-size: 1.25rem;
          color: #fff8eb;
        }

        .admin-alert {
          margin-bottom: 1rem;
        }

        .admin-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.2rem;
        }

        .admin-card {
          background: rgba(10, 24, 47, 0.84);
          border: 1px solid rgba(173, 213, 255, 0.17);
          border-radius: 18px;
          box-shadow: 0 14px 40px rgba(0, 8, 26, 0.3);
          backdrop-filter: blur(6px);
          padding: 1.1rem;
        }

        .admin-card-head h2 {
          margin: 0;
          font-size: 1.4rem;
          font-family: 'Space Grotesk', sans-serif;
          color: #e9f5ff;
        }

        .admin-card-head p {
          margin: 0.35rem 0 0.9rem;
          color: rgba(221, 238, 255, 0.72);
          font-size: 0.9rem;
        }

        .admin-form {
          display: grid;
          gap: 0.95rem;
        }

        .admin-field-grid {
          display: grid;
          gap: 0.75rem;
        }

        .admin-field-grid.two-cols {
          grid-template-columns: 1fr;
        }

        .admin-field label,
        .admin-section-title {
          display: block;
          margin-bottom: 0.3rem;
          color: rgba(223, 238, 255, 0.86);
          font-weight: 600;
          font-size: 0.84rem;
          letter-spacing: 0.02em;
        }

        .admin-section-title {
          margin-bottom: -0.2rem;
          font-size: 0.95rem;
          color: #cde8ff;
        }

        .admin-field input,
        .admin-field select,
        .admin-form input[type='file'] {
          width: 100%;
          padding: 0.65rem 0.75rem;
          border: 1px solid rgba(179, 215, 255, 0.28);
          border-radius: 10px;
          background: rgba(2, 12, 29, 0.62);
          color: #ebf6ff;
          font-size: 0.95rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .admin-field input::placeholder {
          color: rgba(214, 231, 248, 0.55);
        }

        .admin-field input:focus,
        .admin-field select:focus,
        .admin-form input[type='file']:focus {
          outline: none;
          border-color: #49c5ff;
          box-shadow: 0 0 0 3px rgba(73, 197, 255, 0.2);
        }

        .admin-file-picker {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
          padding: 0.55rem;
          border-radius: 10px;
          border: 1px solid rgba(179, 215, 255, 0.28);
          background: rgba(2, 12, 29, 0.62);
        }

        .admin-file-input {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
          padding: 0;
          margin: -1px;
        }

        .admin-file-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.45rem 0.75rem;
          border-radius: 8px;
          background: linear-gradient(130deg, #18c6a5, #3c93ff);
          color: #031327;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          text-decoration: none;
        }

        .admin-file-btn:hover {
          filter: brightness(1.07);
        }

        .admin-file-name {
          color: rgba(221, 238, 255, 0.86);
          font-size: 0.84rem;
          max-width: min(44ch, 100%);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-hint {
          margin-top: 0.4rem;
          color: rgba(201, 224, 246, 0.72);
          font-size: 0.82rem;
        }

        .admin-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(223, 238, 255, 0.92);
          font-size: 0.92rem;
          font-weight: 600;
        }

        .admin-toggle input {
          accent-color: #1ed3a7;
          width: 16px;
          height: 16px;
        }

        .admin-submit-btn {
          border: none;
          border-radius: 12px;
          padding: 0.85rem 1rem;
          background: linear-gradient(130deg, #18c6a5, #3c93ff);
          color: #04152d;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          transition: transform 0.18s ease, filter 0.18s ease;
        }

        .admin-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }

        .admin-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-table-wrap {
          overflow-x: auto;
          border: 1px solid rgba(174, 217, 255, 0.15);
          border-radius: 12px;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 620px;
        }

        .admin-table th,
        .admin-table td {
          padding: 0.72rem 0.75rem;
          text-align: left;
          border-bottom: 1px solid rgba(170, 209, 245, 0.13);
          color: #eef7ff;
          font-size: 0.92rem;
        }

        .admin-table th {
          background: rgba(151, 203, 255, 0.08);
          color: rgba(212, 236, 255, 0.95);
          font-weight: 700;
          position: sticky;
          top: 0;
        }

        .admin-table tbody tr:hover {
          background: rgba(151, 203, 255, 0.08);
        }

        .admin-badge {
          display: inline-block;
          padding: 0.25rem 0.55rem;
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: capitalize;
        }

        .admin-badge-easy {
          background: rgba(27, 201, 143, 0.2);
          color: #7ff2c7;
          border: 1px solid rgba(127, 242, 199, 0.4);
        }

        .admin-badge-medium {
          background: rgba(255, 184, 77, 0.2);
          color: #ffdca0;
          border: 1px solid rgba(255, 220, 160, 0.4);
        }

        .admin-badge-hard {
          background: rgba(255, 122, 122, 0.2);
          color: #ffc0c0;
          border: 1px solid rgba(255, 192, 192, 0.4);
        }

        .admin-badge-active {
          background: rgba(51, 214, 157, 0.18);
          color: #8af2cb;
          border: 1px solid rgba(138, 242, 203, 0.36);
        }

        .admin-badge-inactive {
          background: rgba(197, 208, 219, 0.16);
          color: #d9e2ea;
          border: 1px solid rgba(217, 226, 234, 0.35);
        }

        .admin-actions-cell {
          white-space: nowrap;
        }

        .admin-table-btn {
          border: none;
          border-radius: 8px;
          padding: 0.38rem 0.55rem;
          margin-right: 0.45rem;
          font-size: 0.8rem;
          font-weight: 700;
          transition: filter 0.2s;
        }

        .admin-table-btn:hover {
          filter: brightness(1.08);
        }

        .admin-table-btn-toggle {
          background: #3e92ff;
          color: #e9f3ff;
        }

        .admin-table-btn-delete {
          background: #ff6a6a;
          color: #fff3f3;
        }

        .admin-empty-row {
          text-align: center;
          color: rgba(210, 231, 250, 0.76);
          padding: 1rem;
        }

        .admin-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(1, 8, 22, 0.68);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          z-index: 1000;
        }

        .admin-modal {
          width: min(460px, 100%);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: linear-gradient(145deg, rgba(9, 27, 54, 0.98), rgba(6, 18, 37, 0.98));
          box-shadow: 0 18px 55px rgba(0, 0, 0, 0.45);
          padding: 1rem;
          animation: riseIn 180ms ease;
        }

        .admin-modal h3 {
          margin: 0;
          color: #f2f8ff;
          font-size: 1.1rem;
          font-family: 'Space Grotesk', sans-serif;
        }

        .admin-modal p {
          margin: 0.6rem 0 1rem;
          color: rgba(219, 236, 253, 0.86);
          font-size: 0.93rem;
        }

        .admin-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.6rem;
        }

        .admin-modal-btn {
          border: none;
          border-radius: 9px;
          padding: 0.52rem 0.9rem;
          font-weight: 700;
          font-size: 0.84rem;
        }

        .admin-modal-btn-cancel {
          background: rgba(169, 196, 225, 0.18);
          color: #dcedff;
        }

        .admin-modal-btn-cancel:hover {
          background: rgba(169, 196, 225, 0.28);
        }

        .admin-modal-btn-delete {
          background: #ff6a6a;
          color: #fff3f3;
        }

        .admin-modal-btn-delete:hover {
          filter: brightness(1.06);
        }

        @keyframes riseIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 920px) {
          .admin-grid {
            grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
            align-items: start;
          }

          .admin-field-grid.two-cols {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 919px) {
          .admin-hero {
            grid-template-columns: 1fr;
          }

          .admin-stats-grid {
            max-width: 420px;
          }
        }

        @media (max-width: 520px) {
          .admin-card {
            padding: 0.9rem;
          }

          .admin-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {showDeleteModal && (
        <div className="admin-modal-overlay" onClick={cancelDelete}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Cricketer?</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget?.name || 'this cricketer'}</strong>? This action cannot be undone.
            </p>
            <div className="admin-modal-actions">
              <button className="admin-modal-btn admin-modal-btn-cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="admin-modal-btn admin-modal-btn-delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
