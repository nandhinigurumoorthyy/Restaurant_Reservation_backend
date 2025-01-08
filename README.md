# Restaurant Reservation Backend

This backend is designed to handle authentication, reservation creation, review management, and user profile management for the restaurant reservation system. It uses **Node.js**, **Express.js**, **MongoDB**, **Mongoose**, **JWT (JSON Web Token)**, and **Razorpay** for payment integration.

---

## **Features**:

- **User Authentication**: Provides login and signup functionalities with email and password authentication. It stores user data in MongoDB.
- **JWT**: Secures API routes using JSON Web Tokens for user authentication and authorization.
- **Profile Management**: Allows users to manage their profile details, view reservations, and review history.
- **Reservation Creation**: Handles restaurant reservation requests, storing them in MongoDB.
- **Review Management**: Allows users to create, edit, and delete reviews for restaurants.
- **Razorpay Payment Integration**: Facilitates online payments for reservations using the Razorpay payment gateway.

---

## **Tech Stack**:
- **Backend**:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - JWT (jsonwebtoken)
  - Razorpay
  - Cors
  - Axios

---

## **Prerequisites**:
- Node.js and npm should be installed on your local machine.
- MongoDB should be set up and running on your local system.
- Razorpay Account (for payment gateway integration).

### **Backend Setup**:

### 1. **Clone the Repository**:
   ```bash
   git clone https://github.com/nandhinigurumoorthyy/Restaurant_Reservation_backend.git
   ```

### 2. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

### 3. **Install Dependencies**:
   ```bash
   npm install
   ```

### 4. **Set up MongoDB**:
   - Ensure MongoDB is running locally on your machine and create a database for this backend.
   - Make sure you have the MongoDB connection string available.
   
### 5. **Create `.env` file**:
   - Create a `.env` file in the backend folder.
   ```bash
   DB_CONNECTION_STRING=your_mongo_connection_string
   SECRET_KEY=your_jwt_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

### 6. **Start the Backend**:
   ```bash
   npm start
   ```

---

## **Core Features**:

### 1. **Authentication**:
- **Login**: Endpoint for user login, where users can authenticate using their email and password. 
- **Signup**: Endpoint for user registration, where new users can sign up by providing their email, password, and other required details.

#### **Backend - `authController.js`**:
- Handles user signup and login requests.
- Uses **Bcrypt** to securely hash passwords.
- Generates **JWT tokens** for authenticated users.
- Mongoose used to interact with MongoDB for storing and retrieving user data.

### 2. **JWT (JSON Web Token)**:
- **JWT** is used for securing API routes and sessions.
- After login, the backend sends a JWT token, which must be included in subsequent requests to access protected routes.

#### **Backend - `authMiddleware.js`**:
- Middleware to validate and verify JWT tokens from incoming requests.

### 3. **Profile Management**:
- **Profile**: Users can view and edit their profile information, which is stored and retrieved from MongoDB.
- **Reservations**: Displays a list of past and upcoming reservations made by the user.

#### **Backend - `User.js`**:
- Defines the schema and model for user information in MongoDB.

#### **Frontend - `Profile.js`**:
- Handles rendering the profile page and editing functionalities.

### 4. **Reservation Creation**:
- **Reservation**: Endpoint for users to create reservations by selecting a restaurant, date, and party size.
- **View Reservations**: Allows users to see all their current and past reservations.

#### **Backend - `reservationController.js`**:
- API routes handle creating, retrieving, editing, and deleting reservations.
- Stores reservation data in MongoDB.

#### **Frontend - `ReservationPage.js`**:
- Form for users to fill out reservation details and make reservation requests via Axios.

### 5. **Review Management**:
- **Review**: Allows users to write reviews for restaurants they have visited.
- **Edit/Delete Reviews**: Enables users to edit or delete their own reviews.

#### **Backend - `reviewController.js`**:
- Handles review creation, update, and deletion.
- Uses **MongoDB** to store reviews and maintain the relationship between users and reviews.

#### **Frontend - `ReviewPage.js & ReviewForm.js`**:
- Provides UI to display restaurant reviews and forms for creating and editing reviews.

### 6. **Razorpay Payment Integration**:
- **Razorpay**: Payment gateway used to facilitate online payments for restaurant reservations.

#### **Backend - `paymentController.js`**:
- Handles API routes for payment processing.
- Utilizes **Razorpay** to create orders and process payments.
- **Razorpay** key details are stored securely in `.env`.

#### **Frontend - `ReservationPage.js`**:
- Payment form that sends payment requests to Razorpay.

---

## **Endpoints**:
| Route                  | Description                           |
|-------------------------|---------------------------------------|
| **/api/auth/signup**     | User registration                     |
| **/api/auth/login**      | User authentication                   |
| **/api/reservation**     | Create reservation                    |
| **/api/reservation/:id** | View, edit, or delete reservations     |
| **/api/review**          | Create review                         |
| **/api/review/:id**      | Edit or delete review                 |
| **/api/payment**         | Process payment via Razorpay           |

---

## **Dependencies**:
- **Backend**: `express`, `mongoose`, `jsonwebtoken`, `cors`, `axios`, `razorpay`, `dotenv`

---

## **Environment Variables**:
Ensure you have the following environment variables configured:
- `DB_CONNECTION_STRING`: MongoDB connection string for the database.
- `SECRET_KEY`: Secret key for JWT.
- `RAZORPAY_KEY_ID`: Razorpay API Key ID.
- `RAZORPAY_KEY_SECRET`: Razorpay API Key Secret.

---

## **Razorpay Integration**:
- Create a **Razorpay** account and obtain your **Key ID** and **Key Secret**.
- Store these credentials securely in your `.env` file.

---

## **License**:
This project is licensed under the MIT License.
