import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { quoteService } from '../../services/quotes';
import { Quote } from '../../data/quote.interface';
import { DocumentViewer } from '@ionic-native/document-viewer';
import { File } from '@ionic-native/file';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Platform, AlertController } from 'ionic-angular';



// quoteService



@Component({
  selector: 'page-favourites',
  templateUrl: 'favourites.html',
})
export class FavouritesPage {
//   quotes:Quote[];

//   constructor(private quotesService: quoteService  ) {
//   }
//  ionDidEnter(){
//    this.quotes = this.quotesService.getFavQuote();
//  }
  // ionViewDidLoad() {
  //   console.log('ionViewDidLoad FavouritesPage');
  // }
  pdfjs;
  //docUrl = 'assets/imgs/lead.pdf';
  docUrl = 'assets/imgs/leadold.pdf';
  fb;

  constructor(public navCtrl: NavController, platform: Platform, private alertCrl: AlertController) {
      //this.pdfjs = window['pdfjs-dist/build/pdf'];
      // this.pdfjs = window['PDFViewer'];
      platform.ready().then(res => {
        this.pdfjs = window['pdfjs-dist/build/pdf'];
        this.fb = window['FirebasePlugin'];

        // start the rendering
        this.start();

        // get notification permission
        this.fb.grantPermission();
        // subcribe all users to lead notification channel
        this.fb.subscribe('lead');
        this.fb.setScreenName('Home');

        this.fb.onNotificationOpen(
          newdata => {
            console.log('Data Received', JSON.stringify( newdata  ) ); 
            let alert = this.alertCrl.create({
              title: newdata.title,
              message: newdata.body,
              buttons: ['OK']
            });
            alert.present();
          }
        )
      });
   }

   start() {

    //this.pdfjs.GlobalWorkerOptions.workerSrc = 'assets/pdfjs/build/pdf.worker.js';
    //this.pdfjs.workerSrc = '../../assets/pdfjs/build/pdf.worker.js'; 
    this.pdfjs.workerSrc = 'assets/pdfjs/build/pdf.worker.js'; 

    var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 0.9,
    canvas = (<HTMLCanvasElement> document.getElementById('the-canvas')),
    ctx = canvas.getContext('2d');

    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    function renderPage(num) {
      pageRendering = true;
      // Using promise to fetch the page
      pdfDoc.getPage(num).then(function(page) {
        var viewport = page.getViewport(scale);
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function() {
          pageRendering = false;
          if (pageNumPending !== null) {
            // New page rendering is pending
            renderPage(pageNumPending);
            pageNumPending = null;
          }
        });
      });

      // Update page counters
      document.getElementById('page_num').textContent = num;
      document.getElementById('font_size').textContent = scale.toString();
    }

    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    function queueRenderPage(num) {
      if (pageRendering) {
        pageNumPending = num;
      } else {
        renderPage(num);
      }
    }

    /**
     * Displays previous page.
     */
    function onPrevPage() {
      if (pageNum <= 1) {
        return;
      }
      pageNum--;
      queueRenderPage(pageNum);
    }
    document.getElementById('prev').addEventListener('click', onPrevPage);

    /**
     * Displays next page.
     */
    function onNextPage() {
      if (pageNum >= pdfDoc.numPages) {
        return;
      }
      pageNum++;
      queueRenderPage(pageNum);
    }
    document.getElementById('next').addEventListener('click', onNextPage);

    function reduce() {
      scale = Number((scale -= 0.1).toFixed(2));

      renderPage(pageNum);
    }
    document.getElementById('remove').addEventListener('click', reduce);

    function add() {
      scale = Number((scale += 0.1).toFixed(2));

      renderPage(pageNum);
    }
    document.getElementById('add').addEventListener('click', add);

    document.getElementById('font_size').textContent = scale.toString();

    /**
     * Asynchronously downloads PDF.
     */
    this.pdfjs.getDocument(this.docUrl).then(function(pdfDoc_) {
      pdfDoc = pdfDoc_;
      document.getElementById('page_count').textContent = pdfDoc.numPages;

      // Initial/first page rendering
      renderPage(pageNum);
    });
   }

}
