var gulp       = require('gulp');								 // Подключаем Gulp
		sass         = require('gulp-sass'); 				 //Подключаем Sass пакет,
		browserSync  = require('browser-sync'); 		 // Подключаем Browser Sync
		concat       = require('gulp-concat'); 			 // Подключаем gulp-concat (для конкатенации файлов)
		uglify       = require('gulp-uglifyjs'); 		 // Подключаем gulp-uglifyjs (для сжатия JS)
		cssnano      = require('gulp-cssnano'); 		 // Подключаем пакет для минификации CSS
		rename       = require('gulp-rename'); 			 // Подключаем библиотеку для переименования файлов
		del          = require('del'); 							 // Подключаем библиотеку для удаления файлов и папок
		imagemin     = require('gulp-imagemin'); 		 // Подключаем библиотеку для работы с изображениями
		pngquant     = require('imagemin-pngquant'); // Подключаем библиотеку для работы с png
		cache        = require('gulp-cache'); 			 // Подключаем библиотеку кеширования
		autoprefixer = require('gulp-autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов
		sassGlob 		 = require('gulp-sass-glob'); 	 // NOTE: Also support using ' (single quotes) for example: @import 'vars/**/*.scss';
		plumber 		 = require('gulp-plumber');			 // После ошибки watch продолжает работать
		mqpacker 		 = require("css-mqpacker");			 // Объединяет мелиазапросы
		svgstore 		 = require('gulp-svgstore');		 // Собирает SVG-спрайт
		svgmin 			 = require('gulp-svgmin');			 // Минифицирует svg
		path 				 = require('path');
		runSequence  = require('run-sequence');			 // Процесс сборки проекта выполняется поэтапно
		wait 				 = require('gulp-wait'); 				 // Ожидание после выполненной операции
		cheerio			 = require('gulp-cheerio');			 // Удаление лишних атрибутов из svg
		size 				 = require('gulp-size');				 // Выводит общий размер файлов в потоке и, при необходимости, отдельные размеры файлов
		spritesmith  = require('gulp.spritesmith');	 // Преобразование иконок в спрайт
		buffer			 = require('vinyl-buffer'); 		 // Convert streaming vinyl files to use buffers
		merge 			 = require('merge-stream');			 // Merge (interleave) a bunch of streams
		pngquant		 = require('imagemin-pngquant'); // Минифицирует png


gulp.task('sass', function(){ // Создаем таск Sass
	return gulp.src(['app/sass/**/*.sass', 'app/sass/**/*.scss']) // Берем источник
		.pipe(plumber())
		.pipe(wait(100))
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
		.pipe(gulp.dest('app/css')) // Выгружаем результата в папку app/css
		.pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
	browserSync({ // Выполняем browserSync
		server: { // Определяем параметры сервера
			baseDir: 'app' // Директория для сервера - app
		},
		notify: false // Отключаем уведомления
	});
});

gulp.task('js', function() {
	return gulp.src([ // Берем все необходимые библиотеки
		'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
		'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
		])

		.pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
		.pipe(uglify()) // Сжимаем JS файл
		.pipe(size({
        title: 'Размер',
        showFiles: true,
        showTotal: false,
      }))
		.pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('css-libs', ['sass'], function() {
	return gulp.src('app/css/libs.css') // Выбираем файл для минификации
		.pipe(cssnano()) // Сжимаем
		.pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
		.pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('styles', function () {
    return gulp
        .src('app/main.scss')
				.pipe(plumber({
      errorHandler: function(err) {
        notify.onError({
          title: 'Styles compilation error',
          message: err.message
        })(err);
        this.emit('end');
      }
    }))
    .pipe(wait(100))
        .pipe(sassGlob())
        .pipe(sass())
				.pipe(size({
      title: 'Размер',
      showFiles: true,
      showTotal: false,
    }))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['browser-sync', 'styles', 'css-libs', 'js'], function() {
	gulp.watch(['app/sass/**/*.sass', 'app/sass/**/*.scss'], ['sass']); // Наблюдение за sass файлами в папке sass
	gulp.watch('app/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
	gulp.watch('app/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
	return del.sync('dist'); // Удаляем папку dist перед сборкой
});

gulp.task('img', function() {
	return gulp.src('app/img/**/*') // Берем все изображения из app
		.pipe(cache(imagemin({ // С кешированием
		// .pipe(imagemin({ // Сжимаем изображения без кеширования
			interlaced: true,
			optimizationLevel: 3,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))/**/)
		.pipe(size({
      title: 'Размер',
      showFiles: true,
      showTotal: false,
    }))
		.pipe(gulp.dest('dist/img')) // Выгружаем на продакшен
});

gulp.task('symbols-svg', function () {
    return gulp
        .src('app/img/svg-sprite/*.svg')
				// Берем svg-иконки
				.pipe(svgmin(function (file) {
          return {
            plugins: [{
              cleanupIDs: {
                minify: true
              }
            }]
          }
        }))
				// // Минифицируем
				.pipe(svgstore({ inlineSvg: true }))
        // .pipe(cheerio({
        //   run: function($) {
        //     $('svg').attr('style', 'display:none');
        //   },
        //   parserOptions: {
        //     xmlMode: true
        //   }
        // }))
				.pipe(rename('sprite-svg.svg'))
        .pipe(size({
          title: 'Размер',
          showFiles: true,
          showTotal: false,
        }))
        				// Вывод размеров файла(ов)
        .pipe(gulp.dest('app/img/'))
				// Выгружаем в продакшн
});


// gulp.task('sprite:png', function (callback) {
// 	return gulp
// 			.src('app/img/png-sprite/*.png')
// 			// Берем png-иконки
//         .pipe(spritesmith({
//           imgName: fileName,
//           cssName: 'sprite-png.scss',
//           padding: 4,
//           imgPath: '../img/' + fileName
//         }));
//       let imgStream = spriteData.img
//         .pipe(buffer())
//         .pipe(imagemin({
//           use: [pngquant()]
//         }))
//         .pipe(gulp.dest('app/img'));
//       return merge(imgStream, cssStream);
//
// });

// Копирование изображений


// Копирование JS
gulp.task('copy:js', function () {
	console.log('---------- Копирование js');
  return gulp.src('app/js/**/*')
      .pipe(size({
        title: 'Размер',
        showFiles: true,
        showTotal: false,
      }))
    .pipe(gulp.dest('dist/js'))
});


// Копирование шрифтов
gulp.task('copy:fonts', function () {
	console.log('---------- Копирование шрифтов');
	return gulp.src('app/fonts/**/*')
      .pipe(size({
        title: 'Размер',
        showFiles: true,
        showTotal: false,
      }))
    .pipe(gulp.dest('dist/fonts'))
});

// Копирование html
gulp.task('copy:html', function () {
	console.log('---------- Копирование html');
	return gulp.src('app/*.html')
  	.pipe(gulp.dest('dist'))
});

// Копирование css
gulp.task('copy:css', function () {
	console.log('---------- Копирование сss');
	return gulp.src([ // Переносим библиотеки в продакшен
		'app/css/main.css',
		'app/css/libs.min.css'
		])
	.pipe(gulp.dest('dist/css'))
});

// Копирование изображений со сжатием
gulp.task('copy:img', function () {
  console.log('---------- Копирование изображений');
  return gulp.src('app/img/**/*')
	.pipe(cache(imagemin({ // С кешированием
	// .pipe(imagemin({ // Сжимаем изображения без кеширования
		interlaced: true,
		optimizationLevel: 3,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	}))/**/)
    .pipe(size({
      title: 'Размер',
      showFiles: true,
      showTotal: false,
    }))
    .pipe(gulp.dest('dist/img'))
});


// Сборка всего
gulp.task('build', function (callback) {
  runSequence(
    ['clean'],
		['sass'],
    ['js'],
	  ['styles'],
		// ['img'],
		['symbols-svg'],
		['copy:css', 'copy:js', 'copy:html', 'copy:fonts', 'copy:img'],

    callback);
});


gulp.task('clear', function (callback) {
	return cache.clearAll();
})

gulp.task('default', ['watch']);
