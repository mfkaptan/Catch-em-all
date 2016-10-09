import { ViewChild, forwardRef } from '@angular/core';
import { NavParams, Page, PopoverController, Events } from 'ionic-angular';
import { Geolocation } from 'ionic-native';

import { FilterPopoverComponent } from '../../components/filter-popover/filter-popover.component';
import { MapComponent } from '../../components/map/map.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ConfigService } from '../../services/config.service';
import { PokePOICardComponent } from '../../components/poke-poi-card/poke-poi-card.component';
import { PokeSighting } from '../../models/poke-sighting';
import { Filter } from '../../models/filter';
import { FilterService } from '../../services/filter.service';

@Page({
  template: require('./map.page.html'),
  styles: [require('./map.page.scss')],
  directives: [
    forwardRef(() => NavbarComponent),
    MapComponent,
    PokePOICardComponent
  ]
})
export class MapPage {

  @ViewChild(MapComponent) map: MapComponent;
  @ViewChild(PokePOICardComponent) pokePOICard: PokePOICardComponent;


  static ZOOM_LEVEL = 17;

  positionLoaded: Promise<any> = null;

  constructor(private navParams: NavParams,
              private config:ConfigService,
              private popoverCtrl: PopoverController,
              private events: Events,
              private filterService: FilterService) {
    this.positionLoaded = this.loadPosition();
  }

  loadPosition() {
    let position = this.navParams.get('position');

    if (position) {
      return Promise.resolve(position);
    } else {
      return Geolocation.getCurrentPosition()
        .then(position => {
          return {
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            },
            zoomLevel: MapPage.ZOOM_LEVEL
          };
        });
    }
  }

  ionViewDidEnter() {
    this.initializeMap();
    this.positionLoaded.then(position => this.events.publish('map:goto', position));
  }

  initializeMap() {
    let filter = this.filterService.filter;
    let tileLayer = 'http://{s}.tile.opencyclemap.org/transport/{z}/{x}/{y}.png';
    let apiEndpoint = this.config.apiEndpoint;
    let websocketEndpoint = this.config.websocketEndpoint;

    this.map.initialize({filter, tileLayer, apiEndpoint, websocketEndpoint});
  }

  showFilterPopover($event?): void {
    let popover = this.popoverCtrl.create(FilterPopoverComponent);
    popover.present({
      ev: $event
    });
  }
}
