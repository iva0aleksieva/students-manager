import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updatePicture } from '../services/userService';

function ProfilePage() {
	const { userId } = useAuth();
	const [profile, setProfile] = useState(null);
	const [error, setError] = useState('');
	const [showForm, setShowForm] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [confirmFacultyNumber, setConfirmFacultyNumber] = useState('');
	const [password, setPassword] = useState('');
	const [updating, setUpdating] = useState(false);

	useEffect(() => {
		if (userId) {
			loadProfile();
		}
	}, [userId]);

	const loadProfile = async () => {
		try {
			const data = await getProfile(userId);
			setProfile(data);
			setConfirmFacultyNumber(data.facultyNumber);
		} catch (err) {
			setError('Failed to load profile: ' + err.message);
		}
	};

	const handleFileChange = (e) => {
		setSelectedFile(e.target.files[0]);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!selectedFile) return;

		setUpdating(true);
		try {
			const base64 = await toBase64(selectedFile);
			await updatePicture({
				FacultyNumber: confirmFacultyNumber,
				Password: password,
				Picture: base64
			});
			await loadProfile();
			setShowForm(false);
			setSelectedFile(null);
			setPassword('');
			setError(''); // Clear error on success
		} catch (err) {
			if (err.response?.status === 401 || err.response?.status === 400) {
				setError('Incorrect password. Please try again.');
			} else {
				setError('Failed to update picture: ' + (err.response?.data?.message || err.message));
			}
		} finally {
			setUpdating(false);
		}
	};

	const toBase64 = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result.split(',')[1]);
			reader.onerror = error => reject(error);
		});
	};

	if (!profile) return <div>Loading...</div>;

	return (
		<div class="main-wrap-content profile-section" style={{ display: 'flex', flexWrap: 'wrap', margin: '10rem 0' }}>
			<div className="col-d-25 col-m-100 center card" style={{ padding: '1rem', flexDirection: 'column', display: 'flex', marginBottom: '2rem' }}>
				{profile.base64EncodePicture ? (
					<img src={`data:image/png;base64,${profile.base64EncodePicture}`} style={{ maxWidth: '100%', height: 'auto', borderRadius: '50%' }} alt="avatar" />
				) : (
					<img src="data:image/png;base64,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" style={{ maxWidth: '100%', height: 'auto', borderRadius: '50%' }} alt="avatar" />
				)}
				{!showForm && (
					<button onClick={() => setShowForm(true)} style={{ marginTop: '1rem' }} className="profile-submit-btn">Change Picture</button>
				)}
				{showForm && (
					<div className="profile-section" style={{ marginTop: '1rem' }}>
						{error && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', border: '1px solid red', borderRadius: '4px', backgroundColor: '#ffe6e6' }}>{error}</div>}
						<form onSubmit={handleSubmit}>
							<div style={{ marginBottom: '20px' }}>
								<label className="label-profile-fld">Select new picture:</label>
								<input type="file" accept="image/*" onChange={handleFileChange} required className="block" style={{ marginTop: '5px' }} />
							</div>
							<div className="prel" style={{ marginBottom: '20px' }}>
								<label className="label-profile-fld">Faculty Number:</label>
								<input type="text" className="profile-form-fld" value={confirmFacultyNumber} onChange={(e) => setConfirmFacultyNumber(e.target.value)} required />
								<div className="border-bottom"></div>
							</div>
							<div className="prel" style={{ marginBottom: '20px' }}>
								<label className="label-profile-fld">Password:</label>
								<input type="password" className="profile-form-fld" value={password} onChange={(e) => setPassword(e.target.value)} required />
								<div className="border-bottom"></div>
							</div>
							<div className="profile-btn-container">
								<button type="submit" className="profile-submit-btn" disabled={updating}>{updating ? 'Updating...' : 'Submit'}</button>
								<button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px', background: 'none', border: '1px solid #c8c7c7', padding: '15px 30px', fontSize: '14px', fontWeight: '600', color: '#807f7f' }}>Cancel</button>
							</div>
						</form>
					</div>
				)}
			</div>
			<div className="col-d-75 col-m-100" style={{ padding: '0 1rem' }}>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
					<div className="card" style={{ flex: '1 1 50%', minWidth: '300px', textAlign: 'center' }}>
						<div class="title-small" style={{paddingBottom: '1rem'}}>Студентски профил</div>
						<div>Име</div>
						<p>{profile.fullName}</p>
						<div>Факултетен номер</div>
						<p>{profile.facultyNumber}</p>
					</div>
					<div className="card" style={{ flex: '1 1 50%', minWidth: '300px' }}>
						<div className="title-small" style={{paddingBottom: '1rem', textAlign: 'center'}}>Тест въпроси</div>
						{profile.testQuestions && profile.testQuestions.length > 0 ? (
							<ul class="list" style={{ paddingLeft: '1rem' }}>
								{profile.testQuestions.map((q, index) => (
									<li key={index} style={{ marginBottom: '0.5rem' }}>
										<strong>{q.testQuestionDescription}</strong><br />
										Отговор: {q.questionOptionDescription}<br />
										Правилен: {q.wasCorrect ? 'Да' : 'Не'}
									</li>
								))}
							</ul>
						) : (
							<p>Няма тест въпроси</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default ProfilePage;