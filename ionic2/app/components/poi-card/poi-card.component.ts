import { Component, ViewChild, OnInit, ElementRef, ChangeDetectorRef,
  animate, trigger, state, style, transition } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { Subscription } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { POIBubbleComponent } from '../poi-bubble/poi-bubble.component';
import { PokeDetailPage } from '../../pages/poke-detail/poke-detail.page';
import { TypesComponent } from '../types/types.component';
import { RarityBadgeComponent } from '../rarity-badge/rarity-badge.component';
import { Pokemon } from '../../models/pokemon';

import { PokePOI } from '../../models/poke-poi';
import { PokeSighting } from '../../models/poke-sighting';

let Hammer = require('hammerjs');

@Component({
  selector: 'poke-poi-card',
  template: require('./poi-card.component.html'),
  styles: [require('./poi-card.component.scss')],
  directives: [
    POIBubbleComponent,
    TypesComponent,
    RarityBadgeComponent
  ],
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

  pokePOI: PokePOI;
  pokemon: Pokemon;
  loadPokemon: Subscription;
  slideState: string = 'hidden';

  constructor(private navCtrl: NavController,
              private apiService: ApiService,
              private changeDetectorRef: ChangeDetectorRef,
              private events: Events) { }

  ngOnInit() {
    this.events.subscribe('map:click', ([pokePOI]) => {
      this.show(pokePOI);
    });

    let hammer = new Hammer(this.slideCard.nativeElement);
    hammer.on('swipedown swipeleft swiperight', this.hide.bind(this));
  }

  show(pokePOI: PokePOI) {
    this.cancelRequests();

    this.pokePOI = pokePOI;
    this.pokemon = null;

    // Load Pokemon for given pokemonId
    if (pokePOI instanceof PokeSighting) {
      const pokeSighting = <PokeSighting>pokePOI;
      this.loadPokemon = this.apiService
                             .getPokemonById(pokeSighting.pokemonId)
                             .subscribe(pokemon => {
                                this.slideState = 'visible';
                                this.pokemon = pokemon;
                                this.changeDetectorRef.detectChanges();
                              });
    } else {
      this.slideState = 'visible';
    }
  }

  hide() {
    this.slideState = 'hidden';
  }

  cancelRequests() {
    if (this.loadPokemon && !this.loadPokemon.isUnsubscribed) {
      this.loadPokemon.unsubscribe();
    }
  }

  getPOITypeBadgeLabel(): string {
    switch(this.pokePOI.getType()) {
      case 'prediction':
        return 'Pokemon Prediction';
      case 'sighting':
        return 'Pokemon Sighting';
      case 'mob':
        return 'Pokemon Mob';
    }
  }

  showDirections() {
    this.events.publish('map:directions', this.pokePOI.getLocation());
  }

  launchPokeDex() {
    this.navCtrl.push(PokeDetailPage, { pokemon: this.pokemon });
  }

}
