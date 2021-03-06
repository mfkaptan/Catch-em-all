import { Component, ViewChild, OnInit, ElementRef, ChangeDetectorRef,
  animate, trigger, state, style, transition } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { Subscription } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { PokeDetailPage } from '../../pages/poke-detail/poke-detail.page';
import { Pokemon } from '../../models/pokemon';
import { POI } from '../../models/poi';
import { Sighting } from '../../models/sighting';
import { Prediction } from '../../models/prediction';

import Hammer from 'hammerjs';

@Component({
  selector: 'poke-poi-card',
  templateUrl: './poi-card.component.html',
  animations: [
    trigger('slide', [
      state('visible', style({transform: 'translateY(0)', display: 'inline-block'})),
      state('hidden', style({transform: 'translateY(120%)', display: 'none'})),
      transition('visible <=> hidden', animate('300ms ease')),
    ])
  ]
})
export class POICardComponent implements OnInit {

  @ViewChild('slideCard') slideCard: ElementRef;

  poi: POI;
  pokemon: Pokemon;
  loadPokemon: Subscription;
  slideState: string = 'hidden';

  constructor(private navCtrl: NavController,
              private apiService: ApiService,
              private changeDetectorRef: ChangeDetectorRef,
              private events: Events) { }

  ngOnInit() {
    this.events.subscribe('map:click', ([poi]) => {
      this.show(poi);
    });

    let hammer = new Hammer(this.slideCard.nativeElement);
    hammer.on('swipedown swipeleft swiperight', this.hide.bind(this));
  }

  show(poi: POI) {
    this.cancelRequests();

    this.poi = poi;
    this.pokemon = null;

    // Load Pokemon for given pokemonId
    if (poi instanceof Sighting) {
      const sighting: Sighting = poi;
      this.loadPokemon = this.subscribe(sighting.pokemonId);
    } else if (poi instanceof Prediction) {
      const prediction: Prediction = poi;
      this.loadPokemon = this.subscribe(prediction.pokemonId);
    } else {
      this.slideState = 'visible';
    }
  }

  hide() {
    this.slideState = 'hidden';
  }

  cancelRequests() {
    if (this.loadPokemon && !this.loadPokemon.closed) {
      this.loadPokemon.unsubscribe();
    }
  }

  showDirections() {
    this.events.publish('map:directions', {
      longitude: this.poi.longitude,
      latitude: this.poi.latitude
    });
  }

  launchPokeDex() {
    this.navCtrl.push(PokeDetailPage, { pokemon: this.pokemon });
  }

  subscribe(pokemonId: number): Subscription {
    return (
      this.apiService
          .getPokemonById(pokemonId)
          .subscribe(pokemon => {
            this.slideState = 'visible';
            this.pokemon = pokemon;
          })
    );
  }

}
