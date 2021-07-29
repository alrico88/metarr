import React, { useState } from 'react';
import './App.scss';
import {
  Col, Container, Modal, Row,
} from 'react-bootstrap';
import get from 'lodash/get';
import set from 'lodash/set';
import { getAirportData } from './api';
import Search from './components/Search';
import NearestStations from './components/NearestStations';
import AirportInfo from './components/AirportInfo';
import Credits from './components/Credits';

function App() {
  const [icao, setIcao] = useState('');
  const [showNearest, setShowNearest] = useState(false);
  const [airportInfo, setAirportInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [hasInit, setInit] = useState(false);

  /**
   * Gets the METAR of an ICAO code
   * @param {string} airport
   * @returns {Promise<void>}
   */
  async function getMetar(airport) {
    try {
      setInit(true);
      setLoading(true);
      const data = await getAirportData(airport);

      const currMetar = get(data, 'weather.METAR');

      if (currMetar == null) {
        set(data, 'weather.METAR', '');
      }

      setAirportInfo(data);
    } catch (e) {
      setAirportInfo({});
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function forceSearch(airport) {
    setIcao(airport);
    setShowNearest(false);
    getMetar(airport);
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
                  src="/logo.svg"
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
            onSearch={getMetar}
            onGetNearest={handleModalShow}
          />
          <AirportInfo
            icao={airportInfo.ICAO}
            elevation={airportInfo.elevation}
            name={airportInfo.name}
            metar={get(airportInfo, 'weather.METAR')}
            runways={airportInfo.runwayCount}
            runwaysList={airportInfo.runways}
            loading={loading}
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
