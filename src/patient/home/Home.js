import React from "react";
import './Home.css'
import clinic from '../../img/clinic.jpg';
import aboutus from '../../img/aboutusimg.jpg';
import orthodontics from '../../img/orthodontics.jpg';
import oralsurgery from '../../img/oralsurgery.jpg';
import periodontics from '../../img/periodontics.jpeg';
import restorative from '../../img/restorative.jpg';
import prosthodontics from '../../img/prosthodontics.jpg';
import others from '../../img/others.jpg';
import time from '../../img/time.jpg';
import appointments from '../../img/appointments.jpg';
import faqs from '../../img/faqs.jpg';



//Bootstrap
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Carousel from 'react-bootstrap/Carousel';



//other files


const Home = () => {
    return (
        <>
            <div className="home-box container-fluid">
            <img src={clinic} alt="Clinic" className="homepage-header"/>
                <div className="aboutus-container">
                <Col xs={7}>
                <div className="aboutus-text">
                <h1>ABOUT US </h1>
                <h3> We are a Metro Manila based Dental clinic which caters all your dental needs at an affordable price.
                    An institution that offers state-of-the-art equipment and materials to render quality dental service reasonable to all. 
                    We innovate and use the latest and most accurate tools in the management and treatment of dental problems. 
                    Accompanied our services are dentist with exceptional trainings from prestigious schools on specific fields. 
                    From its humble beginnings from Quezon City, relinquish its vision to the metropolitan; 
                    came branches that serves to impart superior dental management to each and every one and eminence that most have gave gain confidence with. 
                    </h3>
                </div>
                </Col>
                <Col className="img">
                <img src={aboutus} alt="About Us" className="aboutus-img"/>
                </Col>
                </div>
                <Row className="carousel-title">
                    <Col> <h1> SERVICES </h1>
                    <Carousel className="services-carousel">
                        <Carousel.Item className="carousel-item">
                        <img
                            className="services-img"
                            src={orthodontics}
                            alt="Orthodontics Treatment"
                            />
                            <Carousel.Caption className="service-carousel-label">
                            <h3>Orthodontics</h3>
                            <p> Metal, Ceramic, Self Ligating Metal, <br /> Self Ligating Ceramic Braces,  <br /> SWLF & Orthero Clear Aligners </p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item className="carousel-item">
                        <img
                            className="services-img"
                            src= {oralsurgery}
                            alt="Oral Surgery"
                            />
                            <Carousel.Caption className="service-carousel-label">
                            <h3>Oral Surgery</h3>
                            <p> Tooth Extraction, Complicated Extraction, Wisdom Tooth Removal, Frenectomy, Gum Reshaping, Whitening,
                                Root Canal Treatment, Pulpotomy, Apicoectomy & Pulp Regeneration </p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item className="carousel-item">
                        <img
                            className="services-img"
                            src={periodontics}
                            alt="Periodontics"
                            />
                            <Carousel.Caption className="service-carousel-label">
                            <h3>Periodontics</h3>
                            <p> Oral Prophylaxis (Cleaning) & Deep Scaling & Polishing
                            </p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item className="carousel-item">
                        <img
                            className="services-img"
                            src={prosthodontics}
                            alt="Prosthodontics"
                            />
                            <Carousel.Caption className="service-carousel-label">
                            <h3>Prosthodontics</h3>
                            <p> Porcelain Fused to Metal Crowns & Bridges, Hybrid Porcelain Crowns, Bridges and Veeners, Pure Porcelain Crowns, 
                                Temporary Crown, Flexible Dentures & Removable Dentures
                            </p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item className="carousel-item">
                        <img
                            className="services-img"
                            src={restorative}
                            alt="Restorative Dentistry"
                            />
                            <Carousel.Caption className="service-carousel-label">
                            <h3>Restorative Dentistry</h3>
                            <p> Pit and Fissure Sealant, Restoration & Temporary Filling
                            </p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item className="carousel-item">
                        <img
                            className="services-img"
                            src={others}
                            alt="Others"
                            />
                            <Carousel.Caption className="service-carousel-label">
                            <h3>XRAY</h3>
                            <p>Panoramic Xray & Periapical Xray </p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        </Carousel>
                    </Col>
                    <Col> <h1> FAQs </h1>
                    <Carousel className="faqs-carousel">
                        <Carousel.Item className="carousel-item">
                        <img
                            className="faqs-img"
                            src={faqs}
                            alt="FAQs"
                            />
                        </Carousel.Item>
                        <Carousel.Item className="carousel-item">
                        <img
                            className="faqs-img"
                            src={time}
                            alt="Business Hours"
                            />
                            <Carousel.Caption className="faqs-carousel-label">
                            <h3>Business Hours</h3>
                            <p>The Dental Solutions is open from 10AM-8PM on Weekdays & 10AM-6PM on Weekends. </p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        <Carousel.Item className="carousel-item">
                        <img
                            className="faqs-img"
                            src={appointments}
                            alt="Appointments"
                            />
                            <Carousel.Caption className="faqs-carousel-label">
                            <h3>FOR INQUIRIES & APPOINTMENTS </h3>
                            <p>You can message us in VIBER <br /> 0939 9322 187 <br /> 0966 9112 767 <br />  0917 8190 849 </p>
                            </Carousel.Caption>
                        </Carousel.Item>
                        </Carousel>
                    </Col>
                </Row>
                

            

            </div>
        </>
    )
}

export default Home;