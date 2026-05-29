<?php
// Allow the React app to communicate with this script
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Database configuration
$host = 'localhost';
$db_name = 'smac_pv_db';
$username = 'root';
$password = ''; // Default XAMPP password is empty

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $e->getMessage()]);
    exit();
}

// Get the posted data from the React application
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($data)) {
    try {
        // Begin transaction to ensure both PV and reserves save together
        $conn->beginTransaction();

        // 1. Insert into 'pvs' table
        $stmt = $conn->prepare("INSERT INTO pvs (
            pv_number, agence, etablissement, chantier, zone, 
            regularite_support, proprete_support, observations, 
            participant_nom, reception_acceptee
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $pv_number = 'PV-' . rand(1000, 9999);
        
        $stmt->execute([
            $pv_number,
            $data['agence'] ?? null,
            $data['etablissement'] ?? null,
            $data['chantier'] ?? null,
            $data['zone'] ?? null,
            $data['regularite'] ?? 'Conforme',
            $data['proprete'] ?? 'Conforme',
            $data['observations'] ?? null,
            $data['participant'] ?? null,
            isset($data['receptionAcceptee']) ? (int)$data['receptionAcceptee'] : 1
        ]);
        
        $pv_id = $conn->lastInsertId();
        
        // 2. Insert associated Reserves into 'pv_reserves' table
        if (!empty($data['reserves']) && is_array($data['reserves'])) {
            $stmtRes = $conn->prepare("INSERT INTO pv_reserves (pv_id, localisation, details_technique, photos_json) VALUES (?, ?, ?, ?)");
            
            foreach ($data['reserves'] as $reserve) {
                // Encode the photos array to a JSON string for storage
                $photos_json = isset($reserve['photos']) ? json_encode($reserve['photos']) : null;
                
                $stmtRes->execute([
                    $pv_id,
                    $reserve['location'] ?? null,
                    $reserve['details'] ?? null,
                    $photos_json
                ]);
            }
        }
        
        $conn->commit();
        echo json_encode(["status" => "success", "message" => "PV successfully saved with ID: $pv_id"]);
        
    } catch (PDOException $e) {
        $conn->rollBack();
        echo json_encode(["status" => "error", "message" => "Failed to save data: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method or empty data"]);
}
?>