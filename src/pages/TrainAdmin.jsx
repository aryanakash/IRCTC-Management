import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrain, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import "../styles/TrainAdmin.css";

const TrainAdmin = () => {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [editMode, setEditMode] = useState(null);

  const [form, setForm] = useState({
    train_name: "",
    source_station: "",
    destination_station: "",
    departure_time: "",
    arrival_time: "",
    travel_date: "",
    price: "",
    total_seats: "",
  });

  useEffect(() => {
    fetchTrains();
  }, []);

  const fetchTrains = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/trains", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setTrains(res.data);
    } catch (err) {
      setError("Error fetching trains: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "price" || name === "total_seats" ? Number(value) : value });
  };

  const addTrain = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await axios.post("http://localhost:5000/api/admin/trains", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchTrains();
      setForm({
        train_name: "",
        source_station: "",
        destination_station: "",
        departure_time: "",
        arrival_time: "",
        travel_date: "",
        price: "",
        total_seats: "",
      });
      toast.success(`Train "${form.train_name}" added successfully!`);
    } catch (err) {
      setError("Error adding train: " + (err.response?.data?.message || err.message));
      toast.error("Failed to add train. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const deleteTrain = async (id) => {
    if (!window.confirm("Are you sure you want to delete this train?")) return;
    setProcessing(true);
    try {
      await axios.delete(`http://localhost:5000/api/admin/trains/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchTrains();
      toast.success("Train deleted successfully");
    } catch (err) {
      setError("Error deleting train: " + (err.response?.data?.message || err.message));
      toast.error("Failed to delete train. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const enableEdit = (train) => {
    setEditMode(train.id);
    setForm({
      train_name: train.train_name,
      source_station: train.source_station,
      destination_station: train.destination_station,
      departure_time: train.departure_time,
      arrival_time: train.arrival_time,
      travel_date: train.travel_date.split("T")[0],
      price: train.price,
      total_seats: train.total_seats,
    });
  };

  const updateTrain = async (id) => {
    setProcessing(true);
    try {
      await axios.put(`http://localhost:5000/api/admin/trains/${id}`, form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEditMode(null);
      fetchTrains();
      toast.success("Train updated successfully");
    } catch (err) {
      setError("Error updating train: " + (err.response?.data?.message || err.message));
      toast.error("Failed to update train. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="train-admin">
      <div className="train-admin-container">
        <h1><FaTrain /> Manage Trains</h1>

        {error && <p>{error}</p>}

        <form onSubmit={addTrain}>
          <h2>Add New Train</h2>
          {Object.keys(form).map((key) => (
            <div key={key}>
              <label htmlFor={key}>{key.replace(/_/g, " ").toUpperCase()}</label>
              <input
                id={key}
                type={key.includes("time") ? "time" : key.includes("date") ? "date" : key.includes("price") || key.includes("seats") ? "number" : "text"}
                name={key}
                value={form[key]}
                onChange={handleChange}
                required
              />
            </div>
          ))}
          <button type="submit" disabled={processing}>
            {processing ? "Processing..." : <><FaPlus /> Add Train</>}
          </button>
        </form>

        <h2><FaTrain /> Train List</h2>
        {loading ? <p>Loading trains...</p> : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Train</th>
                <th>From</th>
                <th>To</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Date</th>
                <th>Total Seats</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trains.map(train => (
                <tr key={train.id}>
                  <td>{train.id}</td>
                  <td>{editMode === train.id ? <input type="text" name="train_name" value={form.train_name} onChange={handleChange} /> : train.train_name}</td>
                  <td>{train.source_station}</td>
                  <td>{train.destination_station}</td>
                  <td>{train.departure_time}</td>
                  <td>{train.arrival_time}</td>
                  <td>{train.travel_date.split("T")[0]}</td>
                  <td>{train.total_seats}</td>
                  <td>
                    {editMode === train.id ? (
                      <>
                        <button className="save-button" onClick={() => updateTrain(train.id)}>Save</button>
                        <button className="cancel-button" onClick={() => setEditMode(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="edit-button" onClick={() => enableEdit(train)}><FaEdit /> Edit</button>
                        <button className="delete-button" onClick={() => deleteTrain(train.id)}><FaTrash /> Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TrainAdmin;
