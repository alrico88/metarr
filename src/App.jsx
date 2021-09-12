import React, { useState } from 'react';
import './App.scss';
import {
  Col, Container, Modal, Row,
} from 'react-bootstrap';
import { getAirportData, getMetar } from './api';
import Search from './components/Search';
import NearestStations from './components/NearestStations';
import AirportInfo from './components/AirportInfo';
import Credits from './components/Credits';

function App() {
  const [icao, setIcao] = useState('');
  const [showNearest, setShowNearest] = useState(false);
  const [airportInfo, setAirportInfo] = useState({});
  const [metar, setMetar] = useState('');
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingMetar, setLoadingMetar] = useState(false);
  const [hasInit, setInit] = useState(false);

  /**
   * Gets the METAR of an ICAO code
   * @param {string} airport
   * @returns {Promise<void>}
   */
  async function getData(airport) {
    setInit(true);
    setLoadingInfo(true);
    getAirportData(airport)
      .then((data) => {
        setAirportInfo(data);
      }).catch((err) => {
        console.error(err);
        setAirportInfo({});
      }).finally(() => {
        setLoadingInfo(false);
      });

    setLoadingMetar(true);
    getMetar(airport)
      .then((metarData) => {
        setMetar(metarData);
      }).catch((err) => {
        console.error(err);
        setMetar('');
      }).finally(() => {
        setLoadingMetar(false);
      });
  }

  function forceSearch(airport) {
    setIcao(airport);
    setShowNearest(false);
    getData(airport);
  }

  function handleModalShow() {
    setShowNearest(true);
  }

  function handleModalClose() {
    setShowNearest(false);
  }

  return (
    <>
      <main className="flex-shrink-0">
        <Container>
          <Row className="py-2">
            <Col>
              <h1 className="mb-0">
                <img
                  src="/logo.png"
                  className="me-1"
                  alt="metarr logo"
                  height="30"
                />
                metarr
              </h1>
            </Col>
          </Row>
          <Search
            changeIcao={setIcao}
            icao={icao}
            onSearch={getData}
            onGetNearest={handleModalShow}
          />
          <AirportInfo
            icao={airportInfo.ICAO}
            elevation={airportInfo.elevation}
            name={airportInfo.name}
            metar={metar}
            runways={airportInfo.runwayCount}
            runwaysList={airportInfo.runways}
            loadingInfo={loadingInfo}
            loadingMetar={loadingMetar}
            show={hasInit}
          />
          <Modal show={showNearest} size="xl">
            <Modal.Header closeButton onHide={handleModalClose}>
              <Modal.Title>Nearest stations</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {
                showNearest && <NearestStations onGetInfo={forceSearch} />
              }
            </Modal.Body>
          </Modal>
        </Container>
      </main>
      <footer className="mt-auto text-center bg-white py-3">
        <Credits />
      </footer>
    </>
  );
}

export default App;
