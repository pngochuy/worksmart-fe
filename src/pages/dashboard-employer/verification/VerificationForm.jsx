import { useNavigate } from "react-router-dom";

export const VerificationForm = () => {
    const navigate = useNavigate();

    return (
        <div>
        <h2>Verification</h2>
        <p>Choose a verification option:</p>
        <ul>
            <li>
                <button onClick={() => navigate("/employer/verify-tax")}>Verify Tax</button>
            </li>
            <li>
                <button onClick={() => navigate("/employer/business-license")}>
                Upload Business License
                </button>            
            </li>
        </ul>
        </div>
    );
};

export default VerificationForm;
