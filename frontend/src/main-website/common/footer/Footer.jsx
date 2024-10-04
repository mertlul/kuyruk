import React from "react"
import { blog } from "../../../dummydata"
import "./footer.css"
import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <>
      <footer>
        <div className='container padding'>
          <div className='box logo'>
            <h1>TableFlow</h1>
            <span>Virtual Queue System</span>
            <p>Get in the waitlist, but explore while waiting...</p>

            <i className='fab fa-twitter icon'></i>
            <i className='fab fa-instagram icon'></i>
          </div>
          <div className='box link'>
            <h3>Explore</h3>
            <ul>
            <li>
              <Link to='/'>Home</Link>
            </li>
            <li>
              <Link to='/about'>About</Link>
            </li>
            <li>
              <Link to='/pricing'>Pricing</Link>
            </li>
            </ul>
          </div>
          <div className='box last'>
            <h3>Have a Question?</h3>
            <ul>
              <li>
                <i className='fa fa-map'></i>
                Kozyatagı - Dünyanın merkezi
              </li>
              <li>
                <i className='fa fa-phone-alt'></i>
                +90 534 555 35 43
              </li>
              <li>
                <i className='fa fa-paper-plane'></i>
                flowtable@molga.com
              </li>
            </ul>
          </div>
        </div>
      </footer>
      <div className='legal'>
        <p>
          Copyright ©2022 All rights reserved | This template is made with <i className='fa fa-heart'></i> by Molga
        </p>
      </div>
    </>
  )
}

export default Footer
