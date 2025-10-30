import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiService from '../../../api/api';

const CostSplitter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const billId = location.state?.billId;

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [splitType, setSplitType] = useState('equal');
  const [roommates, setRoommates] = useState([{ id: 1, name: '' }]);
  const [customSplits, setCustomSplits] = useState({ you: 50 });
  const [splitResult, setSplitResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (billId) {
      fetchBillDetails();
    } else {
      setLoading(false);
    }
  }, [billId]);

  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUtilityBill(billId);
      setBill(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bill details:', err);
      setError('Failed to load bill details.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const addRoommate = () => {
    const newId = roommates.length + 1;
    setRoommates([...roommates, { id: newId, name: '' }]);
    
    if (splitType === 'custom') {
      const totalPeople = roommates.length + 2; // +1 for new roommate, +1 for you
      const equalPercentage = (100 / totalPeople).toFixed(1);
      const newSplits = { you: parseFloat(equalPercentage) };
      roommates.forEach((_, index) => {
        newSplits[`roommate_${index}`] = parseFloat(equalPercentage);
      });
      newSplits[`roommate_${roommates.length}`] = parseFloat(equalPercentage);
      setCustomSplits(newSplits);
    }
  };

  const removeRoommate = (id) => {
    if (roommates.length === 1) return;
    const newRoommates = roommates.filter(r => r.id !== id);
    setRoommates(newRoommates);
    
    if (splitType === 'custom') {
      const totalPeople = newRoommates.length + 1;
      const equalPercentage = (100 / totalPeople).toFixed(1);
      const newSplits = { you: parseFloat(equalPercentage) };
      newRoommates.forEach((_, index) => {
        newSplits[`roommate_${index}`] = parseFloat(equalPercentage);
      });
      setCustomSplits(newSplits);
    }
  };

  const updateRoommateName = (id, name) => {
    setRoommates(roommates.map(r => r.id === id ? { ...r, name } : r));
  };

  const updateCustomSplit = (key, value) => {
    const numValue = parseFloat(value) || 0;
    setCustomSplits({ ...customSplits, [key]: numValue });
  };

  const calculateSplits = () => {
    if (!bill) return null;

    const totalPeople = roommates.length + 1;
    
    if (splitType === 'equal') {
      const amountPerPerson = bill.amount / totalPeople;
      return [
        { name: 'You', amount: amountPerPerson, percentage: (100 / totalPeople).toFixed(1) },
        ...roommates.map(roommate => ({
          name: roommate.name || 'Roommate',
          amount: amountPerPerson,
          percentage: (100 / totalPeople).toFixed(1)
        }))
      ];
    } else {
      return [
        { name: 'You', amount: bill.amount * (customSplits.you / 100), percentage: customSplits.you },
        ...roommates.map((roommate, index) => ({
          name: roommate.name || 'Roommate',
          amount: bill.amount * ((customSplits[`roommate_${index}`] || 0) / 100),
          percentage: customSplits[`roommate_${index}`] || 0
        }))
      ];
    }
  };

  const getTotalPercentage = () => {
    if (splitType === 'equal') return 100;
    
    let total = customSplits.you || 0;
    roommates.forEach((_, index) => {
      total += customSplits[`roommate_${index}`] || 0;
    });
    return total.toFixed(1);
  };

  const handleSaveSplit = async () => {
    if (!bill) {
      setError('No bill selected');
      return;
    }

    const totalPercentage = parseFloat(getTotalPercentage());
    if (splitType === 'custom' && Math.abs(totalPercentage - 100) > 0.1) {
      setError('Total percentage must equal 100%');
      return;
    }

    const emptyNames = roommates.some(r => !r.name.trim());
    if (emptyNames) {
      setError('Please enter names for all roommates');
      return;
    }

    try {
      setSaving(true);
      const splitData = {
        roommates: roommates.map(r => ({ name: r.name })),
        splitType,
        customSplits: splitType === 'custom' ? customSplits : null
      };

      const result = await apiService.splitUtilityBill(billId, splitData);
      setSplitResult(result.splits);
      setError(null);
    } catch (err) {
      console.error('Error saving split:', err);
      setError('Failed to save split. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const splits = calculateSplits();
  const totalPercentage = getTotalPercentage();
  const isValidSplit = splitType === 'equal' || Math.abs(parseFloat(totalPercentage) - 100) < 0.1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/tenant-dashboard/utilities')}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Utilities
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Split Utility Costs</h1>
        <p className="text-gray-600">Divide utility bills with your roommates</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {splitResult && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-check-circle text-green-500 mr-3"></i>
            <p className="text-green-700">Split saved successfully!</p>
          </div>
        </div>
      )}

      {/* Bill Summary */}
      {bill && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Summary</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Utility Type</p>
              <p className="text-xl font-semibold text-gray-900 capitalize">{bill.utilityType}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(bill.amount)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Split Type Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Split Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setSplitType('equal')}
            className={`p-4 border-2 rounded-lg transition-all ${
              splitType === 'equal'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Equal Split</h3>
              {splitType === 'equal' && <i className="fas fa-check-circle text-blue-600"></i>}
            </div>
            <p className="text-sm text-gray-600">Divide the bill equally among all roommates</p>
          </button>

          <button
            onClick={() => setSplitType('custom')}
            className={`p-4 border-2 rounded-lg transition-all ${
              splitType === 'custom'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Custom Split</h3>
              {splitType === 'custom' && <i className="fas fa-check-circle text-blue-600"></i>}
            </div>
            <p className="text-sm text-gray-600">Set custom percentages for each person</p>
          </button>
        </div>
      </div>

      {/* Roommates */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Roommates</h2>
          <button
            onClick={addRoommate}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            <i className="fas fa-plus mr-2"></i>
            Add Roommate
          </button>
        </div>

        <div className="space-y-4">
          {/* You */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value="You"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            {splitType === 'custom' && (
              <div className="w-32">
                <div className="relative">
                  <input
                    type="number"
                    value={customSplits.you}
                    onChange={(e) => updateCustomSplit('you', e.target.value)}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-8"
                  />
                  <span className="absolute right-3 top-2 text-gray-500">%</span>
                </div>
              </div>
            )}
          </div>

          {/* Roommates */}
          {roommates.map((roommate, index) => (
            <div key={roommate.id} className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={roommate.name}
                  onChange={(e) => updateRoommateName(roommate.id, e.target.value)}
                  placeholder={`Roommate ${index + 1} name`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {splitType === 'custom' && (
                <div className="w-32">
                  <div className="relative">
                    <input
                      type="number"
                      value={customSplits[`roommate_${index}`] || 0}
                      onChange={(e) => updateCustomSplit(`roommate_${index}`, e.target.value)}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-8"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>
              )}
              <button
                onClick={() => removeRoommate(roommate.id)}
                className="text-red-600 hover:text-red-700 p-2"
                disabled={roommates.length === 1}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>

        {splitType === 'custom' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Total Percentage</span>
              <span className={`text-xl font-bold ${isValidSplit ? 'text-green-600' : 'text-red-600'}`}>
                {totalPercentage}%
                {isValidSplit ? (
                  <i className="fas fa-check-circle ml-2"></i>
                ) : (
                  <i className="fas fa-exclamation-circle ml-2"></i>
                )}
              </span>
            </div>
            {!isValidSplit && (
              <p className="text-sm text-red-600 mt-2">
                Total must equal 100%
              </p>
            )}
          </div>
        )}
      </div>

      {/* Split Preview */}
      {bill && splits && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Split Preview</h2>
          <div className="space-y-3">
            {splits.map((split, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="fas fa-user text-blue-600"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{split.name}</p>
                    <p className="text-sm text-gray-600">{split.percentage}% of total</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(split.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => navigate('/tenant-dashboard/utilities')}
          className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveSplit}
          disabled={!bill || !isValidSplit || saving || roommates.some(r => !r.name.trim())}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-2"></i>
              Save Split
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CostSplitter;
