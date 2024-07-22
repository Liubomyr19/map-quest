import React, { FC, useRef, useCallback, useEffect } from 'react'
import { GoogleMap } from '@react-google-maps/api'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import type { IMarker } from '../types/marker'
import styles from './Map.module.scss'
import { defaultTheme } from './Theme'

interface MapProps {
	center: google.maps.LatLngLiteral;
	mode: number;
	markers: IMarker[];
	onMarkerAdd: (marker: IMarker) => void;
	setMarkers: React.Dispatch<React.SetStateAction<IMarker[]>>;
	maxMarkerId: number;
	setMaxMarkerId: React.Dispatch<React.SetStateAction<number>>;
}

const containerStyle = {
	width: '100%',
	height: '100%',
}

const defaultOptions = {
	panControl: true,
	zoomControl: true,
	mapTypeControl: false,
	scaleControl: true,
	streetViewControl: false,
	rotateControl: false,
	clickableIcons: false,
	keyboardShortcuts: false,
	scrollwheel: true,
	disableDoubleClickZoom: false,
	fullscreenControl: false,
	styles: defaultTheme,
}

export const MODES = {
	MOVE: 0,
	SET_MARKER: 1,
}

export const Map: FC<MapProps> = ({
	center,
	mode,
	markers,
	onMarkerAdd,
	setMarkers,
	maxMarkerId,
	setMaxMarkerId,
}) => {
	const mapRef = useRef<google.maps.Map | null>(null)
	const markerClusterRef = useRef<MarkerClusterer | null>(null)

	const onLoad = useCallback((map: google.maps.Map) => {
		mapRef.current = map
		markerClusterRef.current = new MarkerClusterer({ map, markers: [] })
	}, [])

	const onUnmount = useCallback(() => {
		mapRef.current = null
		markerClusterRef.current = null
	}, [])

	const handleMapClick = useCallback(
		(location: google.maps.MapMouseEvent) => {
			if (mode === MODES.SET_MARKER && location.latLng) {
				const newMarkerId = maxMarkerId + 1

				const newMarker: IMarker = {
					id: newMarkerId,
					position: {
						lat: location.latLng.lat(),
						lng: location.latLng.lng(),
					},
				}

				onMarkerAdd(newMarker)
				setMaxMarkerId((prevMax) => prevMax + 1)
			}
		},
		[mode, maxMarkerId, onMarkerAdd, setMaxMarkerId],
	)

	const handleMarkerClick = useCallback(
		(markerId: number) => {
			setMarkers((current) => current.filter((marker) => marker.id !== markerId))

			if (markerId === maxMarkerId) {
				setMaxMarkerId((prevMax) => prevMax - 1)
			}
		},
		[setMarkers, maxMarkerId, setMaxMarkerId],
	)

	const handleMarkerDragEnd = useCallback(
		(event: google.maps.MapMouseEvent, markerId: number) => {
			if (event.latLng) {
				const newPosition = {
					lat: event.latLng.lat(),
					lng: event.latLng.lng(),
				}

				setMarkers((current) =>
					current.map((marker) =>
						marker.id === markerId ? { ...marker, position: newPosition } : marker,
					),
				)
			}
		},
		[setMarkers],
	)

	useEffect(() => {
		if (markerClusterRef.current) {
			markerClusterRef.current.clearMarkers()

			const googleMarkers = markers.map((marker) => {
				const googleMarker = new google.maps.Marker({
					position: marker.position,
					map: mapRef.current,
					draggable: true,
					label: marker.id.toString(),
				})

				const markerClicker = () => handleMarkerClick(marker.id)

				googleMarker.addListener('click', markerClicker)
				googleMarker.addListener(
					'dragend', (event: google.maps.MapMouseEvent) => handleMarkerDragEnd(event, marker.id))

				return googleMarker
			})

			markerClusterRef.current.addMarkers(googleMarkers)
		}
	}, [markers, handleMarkerClick, handleMarkerDragEnd])

	return (
		<div className={styles.container}>
			<GoogleMap
				mapContainerStyle={containerStyle}
				center={center}
				zoom={10}
				onLoad={onLoad}
				onUnmount={onUnmount}
				onClick={handleMapClick}
				options={defaultOptions}
			/>
		</div>
	)
}
