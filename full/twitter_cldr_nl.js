/*
// Copyright 2012 Twitter, Inc
// http://www.apache.org/licenses/LICENSE-2.0

// TwitterCLDR (JavaScript) v1.7.0
// Authors:     Cameron Dutro [@camertron]
                Kirill Lashuk [@KL_7]
                portions by Sven Fuchs [@svenfuchs]
// Homepage:    https://twitter.com
// Description: Provides date, time, number, and list formatting functionality for various Twitter-supported locales in Javascript.
*/

var BaseHelper, Currencies, CurrencyFormatter, DateTimeFormatter, DecimalFormatter, FractionHelper, IntegerHelper, NumberFormatter, PercentFormatter, PluralRules, TimespanFormatter, TwitterCldr,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TwitterCldr = {};

TwitterCldr.NumberFormatter = NumberFormatter = (function() {

  function NumberFormatter() {
    this.all_tokens = {"percent":{"positive":["","#,##0","%"],"negative":["-","#,##0","%"]},"decimal":{"positive":["","#,##0.###"],"negative":["-","#,##0.###"]},"currency":{"positive":["¤ ","#,##0.00"],"negative":["-¤ ","#,##0.00","-"]}};
    this.tokens = [];
    this.symbols = {"plus_sign":"+","infinity":"∞","minus_sign":"-","nan":"NaN","group":".","alias":"","per_mille":"‰","decimal":",","list":";","percent_sign":"%","exponential":"E"};
    this.default_symbols = {
      'group': ',',
      'decimal': '.',
      'plus_sign': '+',
      'minus_sign': '-'
    };
  }

  NumberFormatter.prototype.format = function(number, options) {
    var fraction, fraction_format, int, integer_format, key, opts, prefix, result, sign, suffix, val, _ref, _ref1;
    if (options == null) {
      options = {};
    }
    opts = this.default_format_options_for(number);
    for (key in options) {
      val = options[key];
      opts[key] = options[key] != null ? options[key] : opts[key];
    }
    _ref = this.partition_tokens(this.get_tokens(number, opts)), prefix = _ref[0], suffix = _ref[1], integer_format = _ref[2], fraction_format = _ref[3];
    _ref1 = this.parse_number(number, opts), int = _ref1[0], fraction = _ref1[1];
    result = integer_format.apply(parseFloat(int), opts);
    if (fraction) {
      result += fraction_format.apply(fraction, opts);
    }
    sign = number < 0 && prefix !== "-" ? this.symbols.minus_sign || this.default_symbols.minus_sign : "";
    return "" + sign + prefix + result + suffix;
  };

  NumberFormatter.prototype.partition_tokens = function(tokens) {
    return [tokens[0] || "", tokens[2] || "", new IntegerHelper(tokens[1], this.symbols), new FractionHelper(tokens[1], this.symbols)];
  };

  NumberFormatter.prototype.parse_number = function(number, options) {
    var precision;
    if (options == null) {
      options = {};
    }
    if (options.precision != null) {
      precision = options.precision;
    } else {
      precision = this.precision_from(number);
    }
    number = this.round_to(number, precision);
    return Math.abs(number).toFixed(precision).split(".");
  };

  NumberFormatter.prototype.precision_from = function(num) {
    var parts;
    parts = num.toString().split(".");
    if (parts.length === 2) {
      return parts[1].length;
    } else {
      return 0;
    }
  };

  NumberFormatter.prototype.round_to = function(number, precision) {
    var factor;
    factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
  };

  NumberFormatter.prototype.get_tokens = function() {
    throw "get_tokens() not implemented - use a derived class like PercentFormatter.";
  };

  return NumberFormatter;

})();

TwitterCldr.PercentFormatter = PercentFormatter = (function(_super) {

  __extends(PercentFormatter, _super);

  function PercentFormatter(options) {
    if (options == null) {
      options = {};
    }
    this.default_percent_sign = "%";
    PercentFormatter.__super__.constructor.apply(this, arguments);
  }

  PercentFormatter.prototype.format = function(number, options) {
    if (options == null) {
      options = {};
    }
    return PercentFormatter.__super__.format.call(this, number, options).replace('¤', this.symbols.percent_sign || this.default_percent_sign);
  };

  PercentFormatter.prototype.default_format_options_for = function(number) {
    return {
      precision: 0
    };
  };

  PercentFormatter.prototype.get_tokens = function(number, options) {
    if (number < 0) {
      return this.all_tokens.percent.negative;
    } else {
      return this.all_tokens.percent.positive;
    }
  };

  return PercentFormatter;

})(NumberFormatter);

TwitterCldr.DecimalFormatter = DecimalFormatter = (function(_super) {

  __extends(DecimalFormatter, _super);

  function DecimalFormatter() {
    return DecimalFormatter.__super__.constructor.apply(this, arguments);
  }

  DecimalFormatter.prototype.format = function(number, options) {
    if (options == null) {
      options = {};
    }
    try {
      return DecimalFormatter.__super__.format.call(this, number, options);
    } catch (error) {
      return number;
    }
  };

  DecimalFormatter.prototype.default_format_options_for = function(number) {
    return {
      precision: this.precision_from(number)
    };
  };

  DecimalFormatter.prototype.get_tokens = function(number, options) {
    if (options == null) {
      options = {};
    }
    if (number < 0) {
      return this.all_tokens.decimal.negative;
    } else {
      return this.all_tokens.decimal.positive;
    }
  };

  return DecimalFormatter;

})(NumberFormatter);

TwitterCldr.CurrencyFormatter = CurrencyFormatter = (function(_super) {

  __extends(CurrencyFormatter, _super);

  function CurrencyFormatter(options) {
    if (options == null) {
      options = {};
    }
    this.default_currency_symbol = "$";
    this.default_precision = 2;
    CurrencyFormatter.__super__.constructor.apply(this, arguments);
  }

  CurrencyFormatter.prototype.format = function(number, options) {
    var currency;
    if (options == null) {
      options = {};
    }
    if (options.currency) {
      if (TwitterCldr.Currencies != null) {
        currency = TwitterCldr.Currencies.for_code(options.currency);
        currency || (currency = TwitterCldr.Currencies.for_country(options.currency));
        currency || (currency = {
          symbol: options.currency
        });
      } else {
        currency = {
          symbol: options.currency
        };
      }
    } else {
      currency = {
        symbol: this.default_currency_symbol
      };
    }
    return CurrencyFormatter.__super__.format.call(this, number, options).replace('¤', currency.symbol);
  };

  CurrencyFormatter.prototype.default_format_options_for = function(number) {
    var precision;
    precision = this.precision_from(number);
    if (precision === 0) {
      precision = this.default_precision;
    }
    return {
      precision: precision
    };
  };

  CurrencyFormatter.prototype.get_tokens = function(number, options) {
    if (options == null) {
      options = {};
    }
    if (number < 0) {
      return this.all_tokens.currency.negative;
    } else {
      return this.all_tokens.currency.positive;
    }
  };

  return CurrencyFormatter;

})(NumberFormatter);

TwitterCldr.NumberFormatter.BaseHelper = BaseHelper = (function() {

  function BaseHelper() {}

  BaseHelper.prototype.interpolate = function(string, value, orientation) {
    var i, length, start;
    if (orientation == null) {
      orientation = "right";
    }
    value = value.toString();
    length = value.length;
    start = orientation === "left" ? 0 : -length;
    if (string.length < length) {
      string = (((function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; 0 <= length ? _i < length : _i > length; i = 0 <= length ? ++_i : --_i) {
          _results.push("#");
        }
        return _results;
      })()).join("") + string).slice(-length);
    }
    if (start < 0) {
      string = string.slice(0, start + string.length) + value;
    } else {
      string = string.slice(0, start) + value + string.slice(length);
    }
    return string.replace(/#/g, "");
  };

  return BaseHelper;

})();

TwitterCldr.NumberFormatter.IntegerHelper = IntegerHelper = (function(_super) {

  __extends(IntegerHelper, _super);

  function IntegerHelper(token, symbols) {
    var format;
    if (symbols == null) {
      symbols = {};
    }
    format = token.split('.')[0];
    this.format = this.prepare_format(format, symbols);
    this.groups = this.parse_groups(format);
    this.separator = symbols.group || ',';
  }

  IntegerHelper.prototype.apply = function(number, options) {
    if (options == null) {
      options = {};
    }
    return this.format_groups(this.interpolate(this.format, parseInt(number)));
  };

  IntegerHelper.prototype.format_groups = function(string) {
    var cur_token, token, tokens;
    if (this.groups.length === 0) {
      return string;
    }
    tokens = [];
    cur_token = this.chop_group(string, this.groups[0]);
    tokens.push(cur_token);
    if (cur_token) {
      string = string.slice(0, string.length - cur_token.length);
    }
    while (string.length > this.groups[this.groups.length - 1]) {
      cur_token = this.chop_group(string, this.groups[this.groups.length - 1]);
      tokens.push(cur_token);
      if (cur_token) {
        string = string.slice(0, string.length - cur_token.length);
      }
    }
    tokens.push(string);
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tokens.length; _i < _len; _i++) {
        token = tokens[_i];
        if (token !== null) {
          _results.push(token);
        }
      }
      return _results;
    })()).reverse().join(this.separator);
  };

  IntegerHelper.prototype.parse_groups = function(format) {
    var index, rest, width, widths;
    if (!(index = format.lastIndexOf(','))) {
      return [];
    }
    rest = format.slice(0, index);
    widths = [format.length - index - 1];
    if (rest.lastIndexOf(',') > -1) {
      widths.push(rest.length - rest.lastIndexOf(',') - 1);
    }
    widths = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = widths.length; _i < _len; _i++) {
        width = widths[_i];
        if (width !== null) {
          _results.push(width);
        }
      }
      return _results;
    })();
    widths.reverse();
    return ((function() {
      var _i, _ref, _results;
      _results = [];
      for (index = _i = 0, _ref = widths.length; 0 <= _ref ? _i < _ref : _i > _ref; index = 0 <= _ref ? ++_i : --_i) {
        if (widths.indexOf(widths[index], index + 1) === -1) {
          _results.push(widths[index]);
        }
      }
      return _results;
    })()).reverse();
  };

  IntegerHelper.prototype.chop_group = function(string, size) {
    if (string.length > size) {
      return string.slice(-size);
    } else {
      return null;
    }
  };

  IntegerHelper.prototype.prepare_format = function(format, symbols) {
    return format.replace(",", "").replace("+", symbols.plus_sign).replace("-", symbols.minus_sign);
  };

  return IntegerHelper;

})(BaseHelper);

TwitterCldr.NumberFormatter.FractionHelper = FractionHelper = (function(_super) {

  __extends(FractionHelper, _super);

  function FractionHelper(token, symbols) {
    if (symbols == null) {
      symbols = {};
    }
    this.format = token ? token.split('.').pop() : "";
    this.decimal = symbols.decimal || ".";
    this.precision = this.format.length;
  }

  FractionHelper.prototype.apply = function(fraction, options) {
    var precision;
    if (options == null) {
      options = {};
    }
    precision = options.precision != null ? options.precision : this.precision;
    if (precision > 0) {
      return this.decimal + this.interpolate(this.format_for(options), fraction, "left");
    } else {
      return "";
    }
  };

  FractionHelper.prototype.format_for = function(options) {
    var i, precision;
    precision = options.precision != null ? options.precision : this.precision;
    if (precision) {
      return ((function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; 0 <= precision ? _i < precision : _i > precision; i = 0 <= precision ? ++_i : --_i) {
          _results.push("0");
        }
        return _results;
      })()).join("");
    } else {
      return this.format;
    }
  };

  return FractionHelper;

})(BaseHelper);

TwitterCldr.TimespanFormatter = TimespanFormatter = (function() {

  function TimespanFormatter() {
    this.default_type = "default";
    this.tokens = {"ago":{"hour":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" uur geleden"}],"one":[{"type":"plaintext","value":"1 uur geleden"}]}},"second":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" seconden geleden"}],"one":[{"type":"plaintext","value":"1 seconde geleden"}]}},"day":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" dagen geleden"}],"one":[{"type":"plaintext","value":"1 dag geleden"}]}},"minute":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" minuten geleden"}],"one":[{"type":"plaintext","value":"1 minuut geleden"}]}},"week":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" weken geleden"}],"one":[{"type":"plaintext","value":"1 week geleden"}]}},"month":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" maanden geleden"}],"one":[{"type":"plaintext","value":"1 maand geleden"}]}},"year":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" jaar geleden"}],"one":[{"type":"plaintext","value":"1 jaar geleden"}]}}},"until":{"hour":{"default":{"other":[{"type":"plaintext","value":"Over "},{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" uur"}],"one":[{"type":"plaintext","value":"Over 1 uur"}]}},"second":{"default":{"other":[{"type":"plaintext","value":"Over "},{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" seconden"}],"one":[{"type":"plaintext","value":"Over 1 seconde"}]}},"day":{"default":{"other":[{"type":"plaintext","value":"Over "},{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" dagen"}],"one":[{"type":"plaintext","value":"Over 1 dag"}]}},"minute":{"default":{"other":[{"type":"plaintext","value":"Over "},{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" minuten"}],"one":[{"type":"plaintext","value":"Over 1 minuut"}]}},"week":{"default":{"other":[{"type":"plaintext","value":"Over "},{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" weken"}],"one":[{"type":"plaintext","value":"Over 1 week"}]}},"month":{"default":{"other":[{"type":"plaintext","value":"Over "},{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" maanden"}],"one":[{"type":"plaintext","value":"Over 1 maand"}]}},"year":{"default":{"other":[{"type":"plaintext","value":"Over "},{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" jaar"}],"one":[{"type":"plaintext","value":"Over 1 jaar"}]}}},"none":{"hour":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" uur"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" uur"}]},"short":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" u"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" u"}]},"abbreviated":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":"u"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":"u"}]}},"second":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" seconden"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" seconde"}]},"short":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" sec."}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" sec."}]},"abbreviated":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":"s"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":"s"}]}},"day":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" dagen"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" dag"}]},"short":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" dagen"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" dag"}]},"abbreviated":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":"d"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":"d"}]}},"minute":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" minuten"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" minuut"}]},"short":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" min."}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" min."}]},"abbreviated":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":"m"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":"m"}]}},"week":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" weken"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" week"}]},"short":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" wkn"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" wk"}]}},"month":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" maanden"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" maand"}]},"short":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" mnd"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" mnd"}]}},"year":{"default":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" jaar"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" jaar"}]},"short":{"other":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" jr"}],"one":[{"type":"placeholder","value":"{0}"},{"type":"plaintext","value":" jr"}]}}}};
    this.time_in_seconds = {
      "second": 1,
      "minute": 60,
      "hour": 3600,
      "day": 86400,
      "week": 604800,
      "month": 2629743.83,
      "year": 31556926
    };
  }

  TimespanFormatter.prototype.format = function(seconds, options) {
    var number, strings, token;
    if (options == null) {
      options = {};
    }
    options["direction"] || (options["direction"] = (seconds < 0 ? "ago" : "until"));
    if (options["unit"] === null || options["unit"] === void 0) {
      options["unit"] = this.calculate_unit(Math.abs(seconds));
    }
    options["type"] || (options["type"] = this.default_type);
    options["number"] = this.calculate_time(Math.abs(seconds), options["unit"]);
    number = this.calculate_time(Math.abs(seconds), options["unit"]);
    options["rule"] = TwitterCldr.PluralRules.rule_for(number);
    strings = (function() {
      var _i, _len, _ref, _results;
      _ref = this.tokens[options["direction"]][options["unit"]][options["type"]][options["rule"]];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        token = _ref[_i];
        _results.push(token.value);
      }
      return _results;
    }).call(this);
    return strings.join("").replace(/\{[0-9]\}/, number.toString());
  };

  TimespanFormatter.prototype.calculate_unit = function(seconds) {
    if (seconds < 30) {
      return "second";
    } else if (seconds < 2670) {
      return "minute";
    } else if (seconds < 86369) {
      return "hour";
    } else if (seconds < 604800) {
      return "day";
    } else if (seconds < 2591969) {
      return "week";
    } else if (seconds < 31556926) {
      return "month";
    } else {
      return "year";
    }
  };

  TimespanFormatter.prototype.calculate_time = function(seconds, unit) {
    return Math.round(seconds / this.time_in_seconds[unit]);
  };

  return TimespanFormatter;

})();

TwitterCldr.Currencies = Currencies = (function() {

  function Currencies() {}

  Currencies.currencies = {"Kyrgyzstan":{"symbol":"лв","code":"KGS","currency":"Som"},"Poland":{"symbol":"zł","code":"PLN","currency":"Zloty"},"El Salvador":{"symbol":"$","code":"SVC","currency":"Colon"},"Belize":{"symbol":"BZ$","code":"BZD","currency":"Dollar"},"Mexico":{"symbol":"$","code":"MXN","currency":"Peso"},"Romania":{"symbol":"lei","code":"RON","currency":"New Leu"},"Hong Kong":{"symbol":"$","code":"HKD","currency":"Dollar"},"Colombia":{"symbol":"$","code":"COP","currency":"Peso"},"Latvia":{"symbol":"Ls","code":"LVL","currency":"Lat"},"Syria":{"symbol":"£","code":"SYP","currency":"Pound"},"Laos":{"symbol":"₭","code":"LAK","currency":"Kip"},"Guyana":{"symbol":"$","code":"GYD","currency":"Dollar"},"Panama":{"symbol":"B/.","code":"PAB","currency":"Balboa"},"Hungary":{"symbol":"Ft","code":"HUF","currency":"Forint"},"Yemen":{"symbol":"﷼","code":"YER","currency":"Rial"},"Egypt":{"symbol":"£","code":"EGP","currency":"Pound"},"Venezuela":{"symbol":"Bs","code":"VEF","currency":"Bolivar Fuerte"},"Guernsey":{"symbol":"£","code":"GGP","currency":"Pound"},"Russia":{"symbol":"руб","code":"RUB","currency":"Ruble"},"Lithuania":{"symbol":"Lt","code":"LTL","currency":"Litas"},"Mauritius":{"symbol":"₨","code":"MUR","currency":"Rupee"},"Azerbaijan":{"symbol":"ман","code":"AZN","currency":"New Manat"},"Albania":{"symbol":"Lek","code":"ALL","currency":"Lek"},"North Korea":{"symbol":"₩","code":"KPW","currency":"Won"},"Pakistan":{"symbol":"₨","code":"PKR","currency":"Rupee"},"Brazil":{"symbol":"R$","code":"BRL","currency":"Real"},"Somalia":{"symbol":"S","code":"SOS","currency":"Shilling"},"Costa Rica":{"symbol":"₡","code":"CRC","currency":"Colon"},"Gibraltar":{"symbol":"£","code":"GIP","currency":"Pound"},"Euro Member Countries":{"symbol":"€","code":"EUR","currency":"European Union"},"Afghanistan":{"symbol":"؋","code":"AFN","currency":"Afghani"},"Brunei Darussalam":{"symbol":"$","code":"BND","currency":"Dollar"},"Iran":{"symbol":"﷼","code":"IRR","currency":"Rial"},"Ukraine":{"symbol":"₴","code":"UAH","currency":"Hryvna"},"Jamaica":{"symbol":"J$","code":"JMD","currency":"Dollar"},"Sri Lanka":{"symbol":"₨","code":"LKR","currency":"Rupee"},"Viet Nam":{"symbol":"₫","code":"VND","currency":"Dong"},"Trinidad and Tobago":{"symbol":"TT$","code":"TTD","currency":"Dollar"},"Liberia":{"symbol":"$","code":"LRD","currency":"Dollar"},"Fiji":{"symbol":"$","code":"FJD","currency":"Dollar"},"China":{"symbol":"¥","code":"CNY","currency":"Yuan Renminbi"},"Netherlands Antilles":{"symbol":"ƒ","code":"ANG","currency":"Guilder"},"Cambodia":{"symbol":"៛","code":"KHR","currency":"Riel"},"Botswana":{"symbol":"P","code":"BWP","currency":"Pula"},"Uzbekistan":{"symbol":"лв","code":"UZS","currency":"Som"},"Bahamas":{"symbol":"$","code":"BSD","currency":"Dollar"},"Uruguay":{"symbol":"$U","code":"UYU","currency":"Peso"},"Thailand":{"symbol":"฿","code":"THB","currency":"Baht"},"Indonesia":{"symbol":"Rp","code":"IDR","currency":"Rupiah"},"Mongolia":{"symbol":"₮","code":"MNT","currency":"Tughrik"},"Namibia":{"symbol":"$","code":"NAD","currency":"Dollar"},"East Caribbean":{"symbol":"$","code":"XCD","currency":"Dollar"},"Switzerland":{"symbol":"CHF","code":"CHF","currency":"Franc"},"Seychelles":{"symbol":"₨","code":"SCR","currency":"Rupee"},"Zimbabwe":{"symbol":"Z$","code":"ZWD","currency":"Dollar"},"Bosnia and Herzegovina":{"symbol":"KM","code":"BAM","currency":"Convertible Marka"},"Japan":{"symbol":"¥","code":"JPY","currency":"Yen"},"Tuvalu":{"symbol":"$","code":"TVD","currency":"Dollar"},"Estonia":{"symbol":"kr","code":"EEK","currency":"Kroon"},"Macedonia":{"symbol":"ден","code":"MKD","currency":"Denar"},"Jersey":{"symbol":"£","code":"JEP","currency":"Pound"},"Aruba":{"symbol":"ƒ","code":"AWG","currency":"Guilder"},"Philippines":{"symbol":"₱","code":"PHP","currency":"Peso"},"Ghana":{"symbol":"¢","code":"GHC","currency":"Cedis"},"Isle of Man":{"symbol":"£","code":"IMP","currency":"Pound"},"Bolivia":{"symbol":"$b","code":"BOB","currency":"Boliviano"},"Suriname":{"symbol":"$","code":"SRD","currency":"Dollar"},"Barbados":{"symbol":"$","code":"BBD","currency":"Dollar"},"Croatia":{"symbol":"kn","code":"HRK","currency":"Kuna"},"Chile":{"symbol":"$","code":"CLP","currency":"Peso"},"Argentina":{"symbol":"$","code":"ARS","currency":"Peso"},"Belarus":{"symbol":"p.","code":"BYR","currency":"Ruble"},"Guatemala":{"symbol":"Q","code":"GTQ","currency":"Quetzal"},"United States":{"symbol":"$","code":"USD","currency":"Dollar"},"Falkland Islands (Malvinas)":{"symbol":"£","code":"FKP","currency":"Pound"},"South Africa":{"symbol":"R","code":"ZAR","currency":"Rand"},"Nigeria":{"symbol":"₦","code":"NGN","currency":"Naira"},"United Kingdom":{"symbol":"£","code":"GBP","currency":"Pound"},"Lebanon":{"symbol":"£","code":"LBP","currency":"Pound"},"Sweden":{"symbol":"kr","code":"SEK","currency":"Krona"},"Serbia":{"symbol":"Дин.","code":"RSD","currency":"Dinar"},"Taiwan":{"symbol":"NT$","code":"TWD","currency":"New Dollar"},"Canada":{"symbol":"$","code":"CAD","currency":"Dollar"},"South Korea":{"symbol":"₩","code":"KRW","currency":"Won"},"Australia":{"symbol":"$","code":"AUD","currency":"Dollar"},"Oman":{"symbol":"﷼","code":"OMR","currency":"Rial"},"Malaysia":{"symbol":"RM","code":"MYR","currency":"Ringgit"},"Bermuda":{"symbol":"$","code":"BMD","currency":"Dollar"},"Iceland":{"symbol":"kr","code":"ISK","currency":"Krona"},"Turkey":{"symbol":"₤","code":"TRY","currency":"Lira"},"Saint Helena":{"symbol":"£","code":"SHP","currency":"Pound"},"Saudi Arabia":{"symbol":"﷼","code":"SAR","currency":"Riyal"},"Qatar":{"symbol":"﷼","code":"QAR","currency":"Riyal"},"Bulgaria":{"symbol":"лв","code":"BGN","currency":"Lev"},"Czech Republic":{"symbol":"Kč","code":"CZK","currency":"Koruna"},"New Zealand":{"symbol":"$","code":"NZD","currency":"Dollar"},"Paraguay":{"symbol":"Gs","code":"PYG","currency":"Guarani"},"Singapore":{"symbol":"$","code":"SGD","currency":"Dollar"},"Mozambique":{"symbol":"MT","code":"MZN","currency":"Metical"},"Nepal":{"symbol":"₨","code":"NPR","currency":"Rupee"},"Cuba":{"symbol":"₱","code":"CUP","currency":"Peso"},"Denmark":{"symbol":"kr","code":"DKK","currency":"Krone"},"Norway":{"symbol":"kr","code":"NOK","currency":"Krone"},"Nicaragua":{"symbol":"C$","code":"NIO","currency":"Cordoba"},"Honduras":{"symbol":"L","code":"HNL","currency":"Lempira"},"India":{"symbol":"₨","code":"INR","currency":"Rupee"},"Cayman Islands":{"symbol":"$","code":"KYD","currency":"Dollar"},"Kazakhstan":{"symbol":"лв","code":"KZT","currency":"Tenge"},"Israel":{"symbol":"₪","code":"ILS","currency":"Shekel"},"Dominican Republic":{"symbol":"RD$","code":"DOP","currency":"Peso"},"Peru":{"symbol":"S/.","code":"PEN","currency":"Nuevo Sol"},"Solomon Islands":{"symbol":"$","code":"SBD","currency":"Dollar"}};

  Currencies.countries = function() {
    var country_name, data;
    return this.names || (this.names = (function() {
      var _ref, _results;
      _ref = this.currencies;
      _results = [];
      for (country_name in _ref) {
        data = _ref[country_name];
        _results.push(country_name);
      }
      return _results;
    }).call(this));
  };

  Currencies.currency_codes = function() {
    var country_name, data;
    return this.codes || (this.codes = (function() {
      var _ref, _results;
      _ref = this.currencies;
      _results = [];
      for (country_name in _ref) {
        data = _ref[country_name];
        _results.push(data.code);
      }
      return _results;
    }).call(this));
  };

  Currencies.for_country = function(country_name) {
    return this.currencies[country_name];
  };

  Currencies.for_code = function(currency_code) {
    var country_name, data, final, _ref;
    final = null;
    _ref = this.currencies;
    for (country_name in _ref) {
      data = _ref[country_name];
      if (data.code === currency_code) {
        final = {
          country: country_name,
          code: data.code,
          symbol: data.symbol,
          currency: data.currency
        };
        break;
      }
    }
    return final;
  };

  return Currencies;

})();

TwitterCldr.PluralRules = PluralRules = (function() {

  function PluralRules() {}

  PluralRules.rules = {"keys": ["one","other"], "rule": function(n) { return (function() { if (n == 1) { return "one" } else { return "other" } })(); }};

  PluralRules.all = function() {
    return this.rules.keys;
  };

  PluralRules.rule_for = function(number) {
    try {
      return this.rules.rule(number);
    } catch (error) {
      return "other";
    }
  };

  return PluralRules;

})();

TwitterCldr.DateTimeFormatter = DateTimeFormatter = (function() {

  function DateTimeFormatter() {
    this.tokens = {"date":{"full":[{"type":"pattern","value":"EEEE"},{"type":"plaintext","value":" "},{"type":"pattern","value":"d"},{"type":"plaintext","value":" "},{"type":"pattern","value":"MMMM"},{"type":"plaintext","value":" "},{"type":"pattern","value":"y"}],"long":[{"type":"pattern","value":"d"},{"type":"plaintext","value":" "},{"type":"pattern","value":"MMMM"},{"type":"plaintext","value":" "},{"type":"pattern","value":"y"}],"default":[{"type":"pattern","value":"d"},{"type":"plaintext","value":" "},{"type":"pattern","value":"MMM"},{"type":"plaintext","value":" "},{"type":"pattern","value":"y"}],"short":[{"type":"pattern","value":"dd"},{"type":"plaintext","value":"-"},{"type":"pattern","value":"MM"},{"type":"plaintext","value":"-"},{"type":"pattern","value":"yy"}],"medium":[{"type":"pattern","value":"d"},{"type":"plaintext","value":" "},{"type":"pattern","value":"MMM"},{"type":"plaintext","value":" "},{"type":"pattern","value":"y"}]},"time":{"full":[{"type":"pattern","value":"HH"},{"type":"plaintext","value":":"},{"type":"pattern","value":"mm"},{"type":"plaintext","value":":"},{"type":"pattern","value":"ss"},{"type":"plaintext","value":" "},{"type":"pattern","value":"zzzz"}],"long":[{"type":"pattern","value":"HH"},{"type":"plaintext","value":":"},{"type":"pattern","value":"mm"},{"type":"plaintext","value":":"},{"type":"pattern","value":"ss"},{"type":"plaintext","value":" "},{"type":"pattern","value":"z"}],"default":[{"type":"pattern","value":"HH"},{"type":"plaintext","value":":"},{"type":"pattern","value":"mm"},{"type":"plaintext","value":":"},{"type":"pattern","value":"ss"}],"short":[{"type":"pattern","value":"HH"},{"type":"plaintext","value":":"},{"type":"pattern","value":"mm"}],"medium":[{"type":"pattern","value":"HH"},{"type":"plaintext","value":":"},{"type":"pattern","value":"mm"},{"type":"plaintext","value":":"},{"type":"pattern","value":"ss"}]},"date_time":{"full":[{"type":"pattern","value":"EEEE"},{"type":"plaintext","value":" "},{"type":"pattern","value":"d"},{"type":"plaintext","value":" "},{"type":"pattern","value":"MMMM"},{"type":"plaintext","value":" "},{"type":"pattern","value":"y"},{"type":"plaintext","value":" "},{"type":"pattern","value":"HH"},{"type":"plaintext","value":":"},{"type":"pattern","value":"mm"},{"type":"plaintext","value":":"},{"type":"pattern","value":"ss"},{"type":"plaintext","value":" "},{"type":"pattern","value":"zzzz"}],"long":[{"type":"pattern","value":"d"},{"type":"plaintext","value":" "},{"type":"pattern","value":"MMMM"},{"type":"plaintext","value":" "},{"type":"pattern","value":"y"},{"type":"plaintext","value":" "},{"type":"pattern","value":"HH"},{"type":"plaintext","value":":"},{"type":"pattern","value":"mm"},{"type":"plaintext","value":":"},{"type":"pattern","value":"ss"},{"type":"plaintext","value":" "},{"type":"pattern","value":"z"}],"default":[{"type":"pattern","value":"d"},{"type":"plaintext","value":" "},{"type":"pattern","value":"MMM"},{"type":"plaintext","value":" "},{"type":"pattern","value":"y"},{"type":"plaintext","value":" "},{"type":"pattern","value":"HH"},{"type":"plaintext","value":":"},{"type":"pattern","value":"mm"},{"type":"plaintext","value":":"},{"type":"pattern","value":"ss"}],"short":[{"type":"pattern","value":"dd"},{"type":"plaintext","value":"-"},{"type":"pattern","value":"MM"},{"type":"plaintext","value":"-"},{"type":"pattern","value":"yy"},{"type":"plaintext","value":" "},{"type":"pattern","value":"HH"},{"type":"plaintext","value":":"},{"type":"pattern","value":"mm"}],"medium":[{"type":"pattern","value":"d"},{"type":"plaintext","value":" "},{"type":"pattern","value":"MMM"},{"type":"plaintext","value":" "},{"type":"pattern","value":"y"},{"type":"plaintext","value":" "},{"type":"pattern","value":"HH"},{"type":"plaintext","value":":"},{"type":"pattern","value":"mm"},{"type":"plaintext","value":":"},{"type":"pattern","value":"ss"}]}};
    this.calendar = {"fields":{"hour":"Uur","weekday":"Dag van de week","era":"Tijdperk","second":"Seconde","day":"Dag","minute":"Minuut","week":"week","month":"Maand","zone":"Zone","dayperiod":"AM/PM","year":"Jaar"},"months":{"format":{"narrow":{"5":"M","11":"N","6":"J","1":"J","12":"D","7":"J","2":"F","8":"A","3":"M","9":"S","4":"A","10":"O"},"wide":{"5":"mei","11":"november","6":"juni","1":"januari","12":"december","7":"juli","2":"februari","8":"augustus","3":"maart","9":"september","4":"april","10":"oktober"},"abbreviated":{"5":"mei","11":"nov.","6":"jun.","1":"jan.","12":"dec.","7":"jul.","2":"feb.","8":"aug.","3":"mrt.","9":"sep.","4":"apr.","10":"okt."}},"stand-alone":{"narrow":{"5":"M","11":"N","6":"J","1":"J","12":"D","7":"J","2":"F","8":"A","3":"M","9":"S","4":"A","10":"O"},"wide":{"5":"mei","11":"november","6":"juni","1":"januari","12":"december","7":"juli","2":"februari","8":"augustus","3":"maart","9":"september","4":"april","10":"oktober"},"abbreviated":{"11":"nov","6":"jun","1":"jan","12":"dec","7":"jul","2":"feb","8":"aug","3":"mrt","9":"sep","4":"apr","10":"okt"}}},"days":{"format":{"narrow":{"wed":"W","sat":"Z","fri":"V","mon":"M","sun":"Z","thu":"D","tue":"D"},"wide":{"wed":"woensdag","sat":"zaterdag","fri":"vrijdag","mon":"maandag","sun":"zondag","thu":"donderdag","tue":"dinsdag"},"abbreviated":{"wed":"wo","sat":"za","fri":"vr","mon":"ma","sun":"zo","thu":"do","tue":"di"}},"stand-alone":{"narrow":{"wed":"W","sat":"Z","fri":"V","mon":"M","sun":"Z","thu":"D","tue":"D"},"wide":{"wed":"woensdag","sat":"zaterdag","fri":"vrijdag","mon":"maandag","sun":"zondag","thu":"donderdag","tue":"dinsdag"},"abbreviated":{"wed":"wo","sat":"za","fri":"vr","mon":"ma","sun":"zo","thu":"do","tue":"di"}}},"quarters":{"format":{"narrow":{"1":1,"2":2,"3":3,"4":4},"wide":{"1":"1e kwartaal","2":"2e kwartaal","3":"3e kwartaal","4":"4e kwartaal"},"abbreviated":{"1":"K1","2":"K2","3":"K3","4":"K4"}},"stand-alone":{"narrow":{"1":1,"2":2,"3":3,"4":4},"wide":{"1":"1e kwartaal","2":"2e kwartaal","3":"3e kwartaal","4":"4e kwartaal"},"abbreviated":{"1":"K1","2":"K2","3":"K3","4":"K4"}}},"eras":{"narrow":{"0":"v.C.","1":"n.C."},"abbr":{"0":"v. Chr.","1":"n. Chr."},"name":{"0":"Voor Christus","1":"na Christus"}},"formats":{"date":{"full":{"pattern":"EEEE d MMMM y"},"long":{"pattern":"d MMMM y"},"default":{"pattern":"d MMM y"},"short":{"pattern":"dd-MM-yy"},"medium":{"pattern":"d MMM y"}},"time":{"full":{"pattern":"HH:mm:ss zzzz"},"long":{"pattern":"HH:mm:ss z"},"default":{"pattern":"HH:mm:ss"},"short":{"pattern":"HH:mm"},"medium":{"pattern":"HH:mm:ss"}},"datetime":{"full":{"pattern":"{{date}} {{time}}"},"long":{"pattern":"{{date}} {{time}}"},"default":{"pattern":"{{date}} {{time}}"},"short":{"pattern":"{{date}} {{time}}"},"medium":{"pattern":"{{date}} {{time}}"}}},"periods":{"format":{"narrow":{"noon":"n"},"wide":{"pm":"PM","am":"AM","noon":"12 uur 's middags"},"abbreviated":{"noon":"12 uur 's middags"}},"stand-alone":{"wide":{"pm":"p.m.","am":"voormiddag"},"abbreviated":{"pm":"p.m.","am":"a.m."}}}};
    this.weekday_keys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    this.methods = {
      'G': 'era',
      'y': 'year',
      'Y': 'year_of_week_of_year',
      'Q': 'quarter',
      'q': 'quarter_stand_alone',
      'M': 'month',
      'L': 'month_stand_alone',
      'w': 'week_of_year',
      'W': 'week_of_month',
      'd': 'day',
      'D': 'day_of_month',
      'F': 'day_of_week_in_month',
      'E': 'weekday',
      'e': 'weekday_local',
      'c': 'weekday_local_stand_alone',
      'a': 'period',
      'h': 'hour',
      'H': 'hour',
      'K': 'hour',
      'k': 'hour',
      'm': 'minute',
      's': 'second',
      'S': 'second_fraction',
      'z': 'timezone',
      'Z': 'timezone',
      'v': 'timezone_generic_non_location',
      'V': 'timezone_metazone'
    };
  }

  DateTimeFormatter.prototype.format = function(obj, options) {
    var format_token, token, tokens,
      _this = this;
    format_token = function(token) {
      var result;
      result = "";
      switch (token.type) {
        case "pattern":
          return _this.result_for_token(token, obj);
        default:
          if (token.value.length > 0 && token.value[0] === "'" && token.value[token.value.length - 1] === "'") {
            return token.value.substring(1, token.value.length - 1);
          } else {
            return token.value;
          }
      }
    };
    tokens = this.get_tokens(obj, options);
    return ((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tokens.length; _i < _len; _i++) {
        token = tokens[_i];
        _results.push(format_token(token));
      }
      return _results;
    })()).join("");
  };

  DateTimeFormatter.prototype.get_tokens = function(obj, options) {
    return this.tokens[options.format || "date_time"][options.type || "default"];
  };

  DateTimeFormatter.prototype.result_for_token = function(token, date) {
    return this[this.methods[token.value[0]]](date, token.value, token.value.length);
  };

  DateTimeFormatter.prototype.era = function(date, pattern, length) {
    var choices, index;
    switch (length) {
      case 1:
      case 2:
      case 3:
        choices = this.calendar["eras"]["abbr"];
        break;
      default:
        choices = this.calendar["eras"]["name"];
    }
    index = date.getFullYear() < 0 ? 0 : 1;
    return choices[index];
  };

  DateTimeFormatter.prototype.year = function(date, pattern, length) {
    var year;
    year = date.getFullYear().toString();
    if (length === 2) {
      if (year.length !== 1) {
        year = year.slice(-2);
      }
    }
    if (length > 1) {
      year = ("0000" + year).slice(-length);
    }
    return year;
  };

  DateTimeFormatter.prototype.year_of_week_of_year = function(date, pattern, length) {
    throw 'not implemented';
  };

  DateTimeFormatter.prototype.day_of_week_in_month = function(date, pattern, length) {
    throw 'not implemented';
  };

  DateTimeFormatter.prototype.quarter = function(date, pattern, length) {
    var quarter;
    quarter = ((date.getMonth() / 3) | 0) + 1;
    switch (length) {
      case 1:
        return quarter.toString();
      case 2:
        return ("0000" + quarter.toString()).slice(-length);
      case 3:
        return this.calendar.quarters.format.abbreviated[quarter];
      case 4:
        return this.calendar.quarters.format.wide[quarter];
    }
  };

  DateTimeFormatter.prototype.quarter_stand_alone = function(date, pattern, length) {
    var quarter;
    quarter = (date.getMonth() - 1) / 3 + 1;
    switch (length) {
      case 1:
        return quarter.toString();
      case 2:
        return ("0000" + quarter.toString()).slice(-length);
      case 3:
        throw 'not yet implemented (requires cldr\'s "multiple inheritance")';
        break;
      case 4:
        throw 'not yet implemented (requires cldr\'s "multiple inheritance")';
        break;
      case 5:
        return this.calendar.quarters['stand-alone'].narrow[quarter];
    }
  };

  DateTimeFormatter.prototype.month = function(date, pattern, length) {
    var month_str;
    month_str = (date.getMonth() + 1).toString();
    switch (length) {
      case 1:
        return month_str;
      case 2:
        return ("0000" + month_str).slice(-length);
      case 3:
        return this.calendar.months.format.abbreviated[month_str];
      case 4:
        return this.calendar.months.format.wide[month_str];
      case 5:
        throw 'not yet implemented (requires cldr\'s "multiple inheritance")';
        break;
      default:
        throw "Unknown date format";
    }
  };

  DateTimeFormatter.prototype.month_stand_alone = function(date, pattern, length) {
    switch (length) {
      case 1:
        return date.getMonth().toString();
      case 2:
        return ("0000" + date.getMonth().toString()).slice(-length);
      case 3:
        throw 'not yet implemented (requires cldr\'s "multiple inheritance")';
        break;
      case 4:
        throw 'not yet implemented (requires cldr\'s "multiple inheritance")';
        break;
      case 5:
        return this.calendar.months['stand-alone'].narrow[date.month];
      default:
        throw "Unknown date format";
    }
  };

  DateTimeFormatter.prototype.day = function(date, pattern, length) {
    switch (length) {
      case 1:
        return date.getDate().toString();
      case 2:
        return ("0000" + date.getDate().toString()).slice(-length);
    }
  };

  DateTimeFormatter.prototype.weekday = function(date, pattern, length) {
    var key;
    key = this.weekday_keys[date.getDay()];
    switch (length) {
      case 1:
      case 2:
      case 3:
        return this.calendar.days.format.abbreviated[key];
      case 4:
        return this.calendar.days.format.wide[key];
      case 5:
        return this.calendar.days['stand-alone'].narrow[key];
    }
  };

  DateTimeFormatter.prototype.weekday_local = function(date, pattern, length) {
    var day;
    switch (length) {
      case 1:
      case 2:
        day = date.getDay();
        return (day === 0 ? "7" : day.toString());
      default:
        return this.weekday(date, pattern, length);
    }
  };

  DateTimeFormatter.prototype.weekday_local_stand_alone = function(date, pattern, length) {
    switch (length) {
      case 1:
        return this.weekday_local(date, pattern, length);
      default:
        return this.weekday(date, pattern, length);
    }
  };

  DateTimeFormatter.prototype.period = function(time, pattern, length) {
    if (time.getHours() > 11) {
      return this.calendar.periods.format.wide["pm"];
    } else {
      return this.calendar.periods.format.wide["am"];
    }
  };

  DateTimeFormatter.prototype.hour = function(time, pattern, length) {
    var hour;
    hour = time.getHours();
    switch (pattern[0]) {
      case 'h':
        if (hour > 12) {
          hour = hour - 12;
        } else if (hour === 0) {
          hour = 12;
        }
        break;
      case 'K':
        if (hour > 11) {
          hour = hour - 12;
        }
        break;
      case 'k':
        if (hour === 0) {
          hour = 24;
        }
    }
    if (length === 1) {
      return hour.toString();
    } else {
      return ("000000" + hour.toString()).slice(-length);
    }
  };

  DateTimeFormatter.prototype.minute = function(time, pattern, length) {
    if (length === 1) {
      return time.getMinutes().toString();
    } else {
      return ("000000" + time.getMinutes().toString()).slice(-length);
    }
  };

  DateTimeFormatter.prototype.second = function(time, pattern, length) {
    if (length === 1) {
      return time.getSeconds().toString();
    } else {
      return ("000000" + time.getSeconds().toString()).slice(-length);
    }
  };

  DateTimeFormatter.prototype.second_fraction = function(time, pattern, length) {
    if (length > 6) {
      throw 'can not use the S format with more than 6 digits';
    }
    return ("000000" + Math.round(Math.pow(time.getMilliseconds() * 100.0, 6 - length)).toString()).slice(-length);
  };

  DateTimeFormatter.prototype.timezone = function(time, pattern, length) {
    var hours, minutes;
    hours = ("00" + (time.getTimezoneOffset() / 60).toString()).slice(-2);
    minutes = ("00" + (time.getTimezoneOffset() % 60).toString()).slice(-2);
    switch (length) {
      case 1:
      case 2:
      case 3:
        return "-" + hours + ":" + minutes;
      default:
        return "UTC -" + hours + ":" + minutes;
    }
  };

  DateTimeFormatter.prototype.timezone_generic_non_location = function(time, pattern, length) {
    throw 'not yet implemented (requires timezone translation data")';
  };

  return DateTimeFormatter;

})();
